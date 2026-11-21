import type { NetlifyHandler } from '../lib/http.ts';
export const handler: NetlifyHandler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  body: JSON.stringify({ ok: true, service: 'al-ameen-netlify-functions' }),
});
