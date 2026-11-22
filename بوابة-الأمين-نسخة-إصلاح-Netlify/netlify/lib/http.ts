export interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  isBase64Encoded: boolean;
  headers: Record<string, string | undefined>;
}
export interface NetlifyResponse { statusCode: number; headers?: Record<string, string>; body: string; }
export type NetlifyHandler = (event: NetlifyEvent) => Promise<NetlifyResponse> | NetlifyResponse;

const minuteBuckets = new Map<string, number[]>();

export function json(statusCode: number, data: unknown, headers: Record<string, string> = {}): NetlifyResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
    body: JSON.stringify(data),
  };
}

export function parseBody(event: NetlifyEvent): Record<string, unknown> | null {
  if (!event.body) return null;
  try {
    const parsed: unknown = JSON.parse(event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export function rateLimit(event: NetlifyEvent, limit = 15): NetlifyResponse | null {
  const forwarded = event.headers['x-nf-client-connection-ip']
    || event.headers['x-forwarded-for']
    || 'unknown';
  const ip = forwarded.split(',')[0].trim();
  const now = Date.now();
  const recent = (minuteBuckets.get(ip) || []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= limit) {
    const retry = Math.max(1, Math.ceil((60_000 - (now - recent[0])) / 1000));
    minuteBuckets.set(ip, recent);
    return json(429, {
      error: 'RATE_LIMITED',
      message: 'لقد أرسلت عددًا كبيرًا من الطلبات خلال وقت قصير. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.',
    }, { 'Retry-After': String(retry) });
  }
  recent.push(now);
  minuteBuckets.set(ip, recent);
  return null;
}

export function methodNotAllowed(): NetlifyResponse {
  return json(405, { error: 'METHOD_NOT_ALLOWED', message: 'طريقة الطلب غير مدعومة.' }, { Allow: 'POST' });
}

/**
 * Wraps an event-style handler as a modern Netlify Function
 * (`export default async (req: Request) => Response`). The modern runtime is
 * required for Netlify AI Gateway to inject AI provider credentials.
 */
export function toModernFunction(handler: NetlifyHandler) {
  return async (req: Request): Promise<Response> => {
    const body = req.method === 'GET' || req.method === 'HEAD' ? '' : await req.text();
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => { headers[key] = value; });
    const result = await handler({
      httpMethod: req.method,
      body: body || null,
      isBase64Encoded: false,
      headers,
    });
    return new Response(result.body, { status: result.statusCode, headers: result.headers });
  };
}
