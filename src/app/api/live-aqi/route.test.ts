import {afterEach,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
const {providerFetch}=vi.hoisted(()=>({providerFetch:vi.fn()}));
vi.mock('@/lib/server/retry',()=>({providerFetch,ProviderError:class extends Error{status=429;retryAfter=60;}}));
import {GET} from './route';
import {NextRequest} from 'next/server';
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
it('validates coordinates before contacting the provider',async()=>{const r=await GET(new NextRequest('https://example.org/api/live-aqi?lat=&lon=77'));expect(r.status).toBe(400);expect(providerFetch).not.toHaveBeenCalled();});
it('reports missing configuration without exposing or caching credentials',async()=>{vi.stubEnv('WAQI_API_TOKEN','');const r=await GET(new NextRequest('https://example.org/api/live-aqi?lat=28.61&lon=77.21'));expect(await r.json()).toEqual({status:'unconfigured'});expect(r.headers.get('Cache-Control')).toContain('no-store');expect(providerFetch).not.toHaveBeenCalled();});
it('keeps the token server-side and handles a provider rejection without leaking it',async()=>{vi.stubEnv('WAQI_API_TOKEN','test-only-token');providerFetch.mockResolvedValue({json:async()=>({status:'error',data:'Invalid key'})});const r=await GET(new NextRequest('https://example.org/api/live-aqi?lat=28.61&lon=77.21'));const body=await r.text();expect(body).not.toContain('test-only-token');expect(JSON.parse(body).status).toBe('unavailable');expect(providerFetch.mock.calls[0][0]).toContain('https://api.waqi.info/feed/geo:28.6100;77.2100/');expect(r.headers.get('Vercel-CDN-Cache-Control')).toBe('no-store');});

it('discovers regional station feeds when the coordinate feed has no usable report',async()=>{
 vi.stubEnv('WAQI_API_TOKEN','test-only-token');
 providerFetch.mockImplementation(async(url:string)=>({json:async()=>url.includes('/map/bounds/')?{status:'ok',data:[{uid:123,lat:23.15,lon:80.65},{uid:'unsafe/path',lat:23.15,lon:80.65}]}:url.includes('/feed/@123/')?{status:'ok',data:{aqi:81,city:{name:'Regional source',geo:[23.15,80.65],url:'https://example.org/station'},time:{iso:new Date(Date.now()-30*60000).toISOString()},attributions:[{name:'Provider',url:'https://example.org/'}]}}:{status:'error',data:'Unknown station'}}));
 const r=await GET(new NextRequest('https://example.org/api/live-aqi?lat=23.12&lon=80.60'));const d=await r.json();expect(d.status).toBe('ok');expect(d.reading.station).toBe('Regional source');expect(d.reading.aqi).toBe(81);expect(providerFetch.mock.calls.some(([url])=>url.includes('/feed/@123/'))).toBe(true);expect(providerFetch.mock.calls.some(([url])=>url.includes('unsafe'))).toBe(false);
});
