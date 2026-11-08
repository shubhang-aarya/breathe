import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
vi.mock('server-only',()=>({}));
const { fetchAir } = vi.hoisted(() => ({ fetchAir: vi.fn() }));
vi.mock('@/lib/server/open-meteo', () => ({ fetchAir }));
import { POST } from './route';
const source = { place: { name: 'Coordinates', lat: 0, lon: 0 }, aqi: 0, hours: [], pollutants: {}, kind: 'MODELED', source: 'Open-Meteo · CAMS', observedAt: '2026-11-08T12:00:00Z', fetchedAt: '2026-11-08T12:01:00Z' };
function request(body: object, origin = 'https://breathe.example') { return new NextRequest('https://breathe.example/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json', origin }, body: JSON.stringify(body) }); }
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
it('rejects invalid coordinates and cross-origin requests before fetching data', async () => {
  expect((await POST(request({ lat: 91, lon: 0, question: 'Air?' }))).status).toBe(400);
  expect((await POST(request({ lat: 0, lon: 0, question: 'Air?' }, 'https://other.example'))).status).toBe(403);
  expect(fetchAir).not.toHaveBeenCalled();
});
it('grounds the no-key summary on server data, not client-submitted readings', async () => {
  vi.stubEnv('OPENAI_API_KEY', ''); fetchAir.mockResolvedValue([source]);
  const response = await POST(request({ lat: 0, lon: 0, question: 'How is the air?', aqi: 999 }));
  const result = await response.json();
  expect(result.mode).toBe('summary'); expect(result.air.aqi).toBe(0); expect(result.air.fetchedAt).toBe(source.fetchedAt); expect(result.summary.category).toBe('Good');
  expect(fetchAir).toHaveBeenCalledWith([{ name: '0.00°, 0.00°', lat: 0, lon: 0 }], true);
});
it('replaces unsupported generated quantities with the sourced fallback and never returns credentials', async () => {
  vi.stubEnv('OPENAI_API_KEY', 'test-only'); fetchAir.mockResolvedValue([source]);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'The AQI is 999.' }] }] }))));
  const response = await POST(request({ lat: 0, lon: 0, question: 'Explain the air' }));
  const result = await response.json(); expect(result.mode).toBe('summary'); expect(result.note).toMatch(/unsupported quantities/); expect(result.air.aqi).toBe(0); expect(JSON.stringify(result)).not.toContain('test-only');
});
it('does not answer without server grounding when the provider fails', async () => {
  fetchAir.mockRejectedValue(new Error('Provider failure'));
  const response = await POST(request({ lat: 0, lon: 0, question: 'Explain the air' })); expect(response.status).toBe(503); expect(await response.json()).toHaveProperty('error');
});
it('does not call a paid AI service on Vercel without shared request limiting',async()=>{
 vi.stubEnv('VERCEL','1');vi.stubEnv('UPSTASH_REDIS_REST_URL','');vi.stubEnv('UPSTASH_REDIS_REST_TOKEN','');vi.stubEnv('OPENAI_API_KEY','test-only');fetchAir.mockResolvedValue([source]);
 const outbound=vi.fn();vi.stubGlobal('fetch',outbound);
 const response=await POST(request({lat:0,lon:0,question:'Explain the air'}));const result=await response.json();
 expect(result.mode).toBe('summary');expect(result.note).toMatch(/shared request limiting/);expect(outbound).not.toHaveBeenCalled();
});
