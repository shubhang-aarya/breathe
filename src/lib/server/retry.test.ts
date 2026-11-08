import { afterEach,expect,it,vi } from 'vitest';
vi.mock('server-only',()=>({}));
import { providerFetch,retryDelay } from './retry';
afterEach(()=>vi.useRealTimers());
it('parses provider retry hints',()=>{expect(retryDelay(new Headers({'Retry-After':'60'}))).toBe(60000);expect(retryDelay(new Headers({'x-ratelimit-reset':'45'}))).toBe(45000);expect(retryDelay(new Headers({'Retry-After':'Sun, 08 Nov 2026 12:01:00 GMT'}),Date.parse('2026-11-08T12:00:00Z'))).toBe(60000)});
it('does not retry a long rate-limit cooldown early',async()=>{const fetcher=vi.fn().mockResolvedValue(new Response(null,{status:429,headers:{'Retry-After':'60'}}));await expect(providerFetch('https://example.com',{},fetcher)).rejects.toMatchObject({status:429,retryAfter:60});expect(fetcher).toHaveBeenCalledTimes(1)});
it('does not retry invalid API credentials',async()=>{const fetcher=vi.fn().mockResolvedValue(new Response(null,{status:401}));await expect(providerFetch('https://example.com',{},fetcher)).rejects.toMatchObject({status:401});expect(fetcher).toHaveBeenCalledTimes(1)});
it('backs off and recovers from a temporary provider error',async()=>{vi.useFakeTimers();const fetcher=vi.fn().mockResolvedValueOnce(new Response(null,{status:503})).mockResolvedValueOnce(new Response('{}',{status:200}));const promise=providerFetch('https://example.com',{},fetcher);await vi.runAllTimersAsync();expect((await promise).ok).toBe(true);expect(fetcher).toHaveBeenCalledTimes(2)});
