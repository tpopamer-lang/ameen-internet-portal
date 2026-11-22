import type { NetlifyHandler } from '../lib/http.ts';
import { toModernFunction } from '../lib/http.ts';
const handler: NetlifyHandler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  body: JSON.stringify({ ok: true, service: 'al-ameen-netlify-functions' }),
});

export default toModernFunction(handler);

export const config = { path: '/api/health' };
