import type { NetlifyHandler } from '../lib/http.ts';
import { generateAssistantReply, AssistantServiceError } from '../../server/assistant.ts';
import { resolveRoutePath } from '../../src/config/routes.ts';
import { json, methodNotAllowed, parseBody, rateLimit } from '../lib/http.ts';

export const handler: NetlifyHandler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const limited = rateLimit(event);
  if (limited) return limited;
  const body = parseBody(event);
  if (!body) return json(400, { error: 'INVALID_BODY', message: 'بيانات الطلب غير صالحة.' });
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return json(400, { error: 'EMPTY_MESSAGE', message: 'يرجى كتابة سؤالك قبل الإرسال.' });
  if (message.length > 500) return json(400, { error: 'MESSAGE_TOO_LONG', message: 'الرسالة طويلة جدًا. الحد الأقصى هو 500 حرف.' });
  const history = Array.isArray(body.history) ? body.history.slice(-16).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const turn = item as { role?: unknown; content?: unknown };
    if ((turn.role !== 'user' && turn.role !== 'assistant') || typeof turn.content !== 'string' || !turn.content.trim()) return [];
    return [{ role: turn.role, content: turn.content.trim().slice(0, 1000) }];
  }) : [];
  const currentPath = resolveRoutePath(typeof body.currentPath === 'string' ? body.currentPath : '/');
  try {
    return json(200, await generateAssistantReply({ message, history, currentPath }));
  } catch (error) {
    if (error instanceof AssistantServiceError) return json(error.statusCode, { error: 'ASSISTANT_ERROR', message: error.userMessage });
    console.error('[AlAmeenAssistant]', error);
    return json(500, { error: 'INTERNAL_ERROR', message: 'حدث خطأ غير متوقع أثناء معالجة سؤالك. يرجى المحاولة مجددًا أو التواصل معنا عبر صفحة اتصل بنا.' });
  }
};
