import type { NetlifyHandler } from '../lib/http.ts';
import { synthesizeArabicSpeech } from '../../server/voiceAssistant.ts';
import { AssistantServiceError } from '../../server/assistant.ts';
import { json, methodNotAllowed, parseBody, rateLimit } from '../lib/http.ts';

export const handler: NetlifyHandler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const limited = rateLimit(event);
  if (limited) return limited;
  const body = parseBody(event);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text) return json(400, { error: 'EMPTY_TEXT', message: 'لا يوجد نص لتحويله إلى صوت.' });
  try {
    const audioBase64 = await synthesizeArabicSpeech(text);
    return json(200, { audioBase64, mimeType: 'audio/wav' });
  } catch (error) {
    if (error instanceof AssistantServiceError) return json(error.statusCode, { error: 'TTS_ERROR', message: error.userMessage });
    console.error('[VoiceTTS]', error);
    return json(500, { error: 'INTERNAL_ERROR', message: 'تعذر توليد الصوت حاليًا.' });
  }
};
