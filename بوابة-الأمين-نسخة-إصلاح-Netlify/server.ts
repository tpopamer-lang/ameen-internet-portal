import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveRoutePath } from './src/config/routes.ts';
import {
  AssistantServiceError,
  generateAssistantReply,
  type ChatTurnInput,
} from './server/assistant.ts';
import {
  analyzeVoiceServiceRequest,
  synthesizeArabicSpeech,
  transcribeArabicVoice,
  type VoiceTurnInput,
} from './server/voiceAssistant.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 16;
const MAX_HISTORY_ITEM_LENGTH = 1000;
const MAX_AUDIO_BASE64_LENGTH = 6_000_000; // ~4.4MB audio clip limit

interface RateBucket {
  minuteTimestamps: number[];
  quarterHourTimestamps: number[];
}

const rateLimitStore = new Map<string, RateBucket>();
const MINUTE_WINDOW_MS = 60_000;
const MINUTE_LIMIT = 15;
const QUARTER_HOUR_WINDOW_MS = 15 * 60_000;
const QUARTER_HOUR_LIMIT = 60;

// Periodically prune stale IP buckets to avoid unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateLimitStore.entries()) {
    bucket.minuteTimestamps = bucket.minuteTimestamps.filter(
      (ts) => now - ts < MINUTE_WINDOW_MS
    );
    bucket.quarterHourTimestamps = bucket.quarterHourTimestamps.filter(
      (ts) => now - ts < QUARTER_HOUR_WINDOW_MS
    );
    if (
      bucket.minuteTimestamps.length === 0 &&
      bucket.quarterHourTimestamps.length === 0
    ) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60_000).unref();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  let bucket = rateLimitStore.get(ip);
  if (!bucket) {
    bucket = { minuteTimestamps: [], quarterHourTimestamps: [] };
    rateLimitStore.set(ip, bucket);
  }

  bucket.minuteTimestamps = bucket.minuteTimestamps.filter(
    (ts) => now - ts < MINUTE_WINDOW_MS
  );
  bucket.quarterHourTimestamps = bucket.quarterHourTimestamps.filter(
    (ts) => now - ts < QUARTER_HOUR_WINDOW_MS
  );

  if (bucket.minuteTimestamps.length >= MINUTE_LIMIT) {
    const oldest = bucket.minuteTimestamps[0];
    const retryAfterSec = Math.max(
      1,
      Math.ceil((MINUTE_WINDOW_MS - (now - oldest)) / 1000)
    );
    return { allowed: false, retryAfterSec };
  }

  if (bucket.quarterHourTimestamps.length >= QUARTER_HOUR_LIMIT) {
    const oldest = bucket.quarterHourTimestamps[0];
    const retryAfterSec = Math.max(
      1,
      Math.ceil((QUARTER_HOUR_WINDOW_MS - (now - oldest)) / 1000)
    );
    return { allowed: false, retryAfterSec };
  }

  bucket.minuteTimestamps.push(now);
  bucket.quarterHourTimestamps.push(now);
  return { allowed: true };
}

function sanitizeHistory(rawHistory: unknown): ChatTurnInput[] {
  if (!Array.isArray(rawHistory)) return [];

  const sanitized: ChatTurnInput[] = [];
  const slice = rawHistory.slice(-MAX_HISTORY_TURNS);

  for (const item of slice) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as { role?: unknown; content?: unknown };
    const role =
      candidate.role === 'user' || candidate.role === 'assistant'
        ? candidate.role
        : null;
    const content =
      typeof candidate.content === 'string' ? candidate.content.trim() : '';

    if (role && content.length > 0) {
      sanitized.push({
        role,
        content: content.slice(0, MAX_HISTORY_ITEM_LENGTH),
      });
    }
  }

  return sanitized;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Dedicated larger JSON parser strictly for audio transcription payloads
  app.post(
    '/api/voice/transcribe',
    express.json({ limit: '7mb' }),
    async (req: Request, res: Response) => {
      const clientIp = getClientIp(req);
      const rate = checkRateLimit(clientIp);
      if (!rate.allowed) {
        res.setHeader('Retry-After', String(rate.retryAfterSec ?? 60));
        return res.status(429).json({
          error: 'RATE_LIMITED',
          message:
            'لقد أرسلت عددًا كبيرًا من الطلبات خلال وقت قصير. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.',
        });
      }

      const body = req.body as {
        audioBase64?: unknown;
        mimeType?: unknown;
      } | null;

      const audioBase64 =
        body && typeof body.audioBase64 === 'string'
          ? body.audioBase64.trim()
          : '';
      const mimeType =
        body && typeof body.mimeType === 'string'
          ? body.mimeType.trim()
          : 'audio/webm';

      if (!audioBase64) {
        return res.status(400).json({
          error: 'EMPTY_AUDIO',
          message: 'لم يتم استلام تسجيل صوتي. يرجى إعادة المحاولة.',
        });
      }

      if (audioBase64.length > MAX_AUDIO_BASE64_LENGTH) {
        return res.status(413).json({
          error: 'AUDIO_TOO_LARGE',
          message: 'التسجيل الصوتي طويل جدًا. يرجى تسجيل رسالة أقصر.',
        });
      }

      try {
        const transcript = await transcribeArabicVoice({
          audioBase64,
          mimeType,
        });
        return res.json({ transcript });
      } catch (error: unknown) {
        if (error instanceof AssistantServiceError) {
          console.error('[VoiceTranscribe]', error.message);
          return res.status(error.statusCode).json({
            error: 'TRANSCRIBE_ERROR',
            message: error.userMessage,
          });
        }
        console.error('[VoiceTranscribe] Unexpected error:', error);
        return res.status(500).json({
          error: 'INTERNAL_ERROR',
          message: 'تعذر تفريغ الصوت حاليًا. يمكنك كتابة طلبك نصيًا.',
        });
      }
    }
  );

  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/assistant/chat', async (req: Request, res: Response) => {
    const clientIp = getClientIp(req);
    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      res.setHeader('Retry-After', String(rate.retryAfterSec ?? 60));
      return res.status(429).json({
        error: 'RATE_LIMITED',
        message:
          'لقد أرسلت عددًا كبيرًا من الرسائل خلال وقت قصير. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى، أو التواصل مع الدعم الفني.',
      });
    }

    const body = req.body as {
      message?: unknown;
      history?: unknown;
      currentPath?: unknown;
    } | null;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        error: 'INVALID_BODY',
        message: 'بيانات الطلب غير صالحة.',
      });
    }

    const rawMessage =
      typeof body.message === 'string' ? body.message.trim() : '';
    if (!rawMessage) {
      return res.status(400).json({
        error: 'EMPTY_MESSAGE',
        message: 'يرجى كتابة سؤالك قبل الإرسال.',
      });
    }

    if (rawMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: 'MESSAGE_TOO_LONG',
        message: `الرسالة طويلة جدًا. الحد الأقصى هو ${MAX_MESSAGE_LENGTH} حرفًا.`,
      });
    }

    const history = sanitizeHistory(body.history);
    const currentPath = resolveRoutePath(
      typeof body.currentPath === 'string' ? body.currentPath : '/'
    );

    try {
      const result = await generateAssistantReply({
        message: rawMessage,
        history,
        currentPath,
      });
      return res.json(result);
    } catch (error: unknown) {
      if (error instanceof AssistantServiceError) {
        console.error('[AlAmeenAssistant]', error.message);
        return res.status(error.statusCode).json({
          error: 'ASSISTANT_ERROR',
          message: error.userMessage,
        });
      }

      console.error('[AlAmeenAssistant] Unexpected error:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message:
          'حدث خطأ غير متوقع أثناء معالجة سؤالك. يرجى المحاولة مجددًا أو التواصل معنا عبر صفحة اتصل بنا.',
      });
    }
  });

  app.post('/api/voice/analyze', async (req: Request, res: Response) => {
    const clientIp = getClientIp(req);
    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      res.setHeader('Retry-After', String(rate.retryAfterSec ?? 60));
      return res.status(429).json({
        error: 'RATE_LIMITED',
        message:
          'لقد أرسلت عددًا كبيرًا من الطلبات خلال وقت قصير. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.',
      });
    }

    const body = req.body as {
      message?: unknown;
      history?: unknown;
      currentDraft?: unknown;
    } | null;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        error: 'INVALID_BODY',
        message: 'بيانات الطلب غير صالحة.',
      });
    }

    const rawMessage =
      typeof body.message === 'string' ? body.message.trim() : '';
    if (!rawMessage) {
      return res.status(400).json({
        error: 'EMPTY_MESSAGE',
        message: 'يرجى التحدث أو كتابة تفاصيل طلبك أولاً.',
      });
    }

    if (rawMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: 'MESSAGE_TOO_LONG',
        message: `النص طويل جدًا. الحد الأقصى هو ${MAX_MESSAGE_LENGTH} حرفًا.`,
      });
    }

    const history: VoiceTurnInput[] = sanitizeHistory(body.history);
    const currentDraft =
      body.currentDraft && typeof body.currentDraft === 'object'
        ? (body.currentDraft as Record<string, unknown>)
        : {};

    try {
      const result = await analyzeVoiceServiceRequest({
        message: rawMessage,
        history,
        currentDraft,
      });
      return res.json(result);
    } catch (error: unknown) {
      if (error instanceof AssistantServiceError) {
        console.error('[VoiceAnalyze]', error.message);
        return res.status(error.statusCode).json({
          error: 'ANALYZE_ERROR',
          message: error.userMessage,
        });
      }
      console.error('[VoiceAnalyze] Unexpected error:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message:
          'حدث خطأ غير متوقع أثناء تحليل طلبك. يرجى المحاولة مرة أخرى.',
      });
    }
  });

  app.post('/api/voice/tts', async (req: Request, res: Response) => {
    const clientIp = getClientIp(req);
    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      res.setHeader('Retry-After', String(rate.retryAfterSec ?? 60));
      return res.status(429).json({
        error: 'RATE_LIMITED',
        message: 'يرجى الانتظار قليلاً قبل طلب القراءة الصوتية.',
      });
    }

    const body = req.body as { text?: unknown } | null;
    const text =
      body && typeof body.text === 'string' ? body.text.trim() : '';
    if (!text) {
      return res.status(400).json({
        error: 'EMPTY_TEXT',
        message: 'لا يوجد نص لتحويله إلى صوت.',
      });
    }

    try {
      const audioBase64 = await synthesizeArabicSpeech(text);
      return res.json({ audioBase64, mimeType: 'audio/wav' });
    } catch (error: unknown) {
      if (error instanceof AssistantServiceError) {
        console.error('[VoiceTTS]', error.message);
        return res.status(error.statusCode).json({
          error: 'TTS_ERROR',
          message: error.userMessage,
        });
      }
      console.error('[VoiceTTS] Unexpected error:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'تعذر توليد الصوت حاليًا.',
      });
    }
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Al-Ameen Internet Portal server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
