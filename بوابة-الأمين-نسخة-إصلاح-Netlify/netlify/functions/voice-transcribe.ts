import type { NetlifyHandler } from '../lib/http.ts';
import { transcribeArabicVoice } from '../../server/voiceAssistant.ts';
import { AssistantServiceError } from '../../server/assistant.ts';
import { json, methodNotAllowed, parseBody, rateLimit } from '../lib/http.ts';

export const handler: NetlifyHandler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const limited = rateLimit(event);
  if (limited) return limited;
  const body = parseBody(event);
  const audioBase64 = typeof body?.audioBase64 === 'string' ? body.audioBase64.trim() : '';
  const mimeType = typeof body?.mimeType === 'string' ? body.mimeType.trim() : 'audio/webm';
  if (!audioBase64) return json(400, { error: 'EMPTY_AUDIO', message: 'لم يتم استلام تسجيل صوتي. يرجى إعادة المحاولة.' });
  if (audioBase64.length > 5_000_000) return json(413, { error: 'AUDIO_TOO_LARGE', message: 'التسجيل الصوتي طويل جدًا. يرجى تسجيل رسالة أقصر.' });
  try {
    const transcript = await transcribeArabicVoice({ audioBase64, mimeType });
    return json(200, { transcript });
  } catch (error) {
    if (error instanceof AssistantServiceError) return json(error.statusCode, { error: 'TRANSCRIBE_ERROR', message: error.userMessage });
    console.error('[VoiceTranscribe]', error);
    return json(500, { error: 'INTERNAL_ERROR', message: 'تعذر تفريغ الصوت حاليًا. يمكنك كتابة طلبك نصيًا.' });
  }
};
