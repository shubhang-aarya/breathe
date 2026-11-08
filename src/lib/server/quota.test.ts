import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('server-only',()=>({}));
import { takeBudget, recordProviderCooldown } from './quota';
beforeEach(()=>{vi.stubEnv('UPSTASH_REDIS_REST_URL','');vi.stubEnv('UPSTASH_REDIS_REST_TOKEN','')});
afterEach(()=>vi.unstubAllEnvs());
it('coordinates shared minute/hour reservations atomically and respects shared cooldowns',async()=>{
 vi.stubEnv('UPSTASH_REDIS_REST_URL','https://redis.example');vi.stubEnv('UPSTASH_REDIS_REST_TOKEN','test-only');
 const fetcher=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({result:[1,0]}))).mockResolvedValueOnce(new Response(JSON.stringify({result:[0,43]})));
 expect(await takeBudget('openaq',fetcher)).toEqual({allowed:true,retryAfter:0,shared:true});
 expect(await takeBudget('openaq',fetcher)).toEqual({allowed:false,retryAfter:43,shared:true});
 const body=JSON.parse(fetcher.mock.calls[0][1].body);expect(body[0]).toBe('EVAL');expect(body[2]).toBe(3);expect(body.slice(-4)).toEqual([30,60,1000,3600]);
});
it('fails closed on configured shared-store failures and malformed responses',async()=>{
 vi.stubEnv('UPSTASH_REDIS_REST_URL','https://redis.example');vi.stubEnv('UPSTASH_REDIS_REST_TOKEN','test-only');
 for(const response of [new Response(null,{status:503}),new Response(JSON.stringify({result:'bad'})),new Response(JSON.stringify({result:[0,-1]}))]) await expect(takeBudget('assistant',vi.fn().mockResolvedValue(response))).rejects.toThrow('Request limiting');
});
it('does not silently fall back when only half of the shared configuration is present',async()=>{
 vi.stubEnv('UPSTASH_REDIS_REST_URL','https://redis.example');await expect(takeBudget('assistant')).rejects.toThrow('Request limiting');
});
it('retains the longest provider cooldown and allows requests after expiry locally',async()=>{
 const now=10_000_000;await recordProviderCooldown('openaq',120,fetch,now);await recordProviderCooldown('openaq',10,fetch,now);
 expect((await takeBudget('openaq',fetch,now+11000)).retryAfter).toBe(109);
 expect((await takeBudget('openaq',fetch,now+121000)).allowed).toBe(true);
});
