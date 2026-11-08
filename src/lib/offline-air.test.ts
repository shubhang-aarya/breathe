import { expect,it,vi } from 'vitest';
import { fetchAirWithOffline } from './offline-air';
import type { Air } from './air';
const original=[{aqi:0,fetchedAt:'2026-11-08T12:00:00Z',observedAt:'2026-11-08T11:00:00Z'}] as Air[];
it('marks fallback stale and preserves the actual original times and zero',async()=>{const result=await fetchAirWithOffline('/api/air?lat=0&lon=0',{fetcher:vi.fn().mockRejectedValue(new Error('offline')),read:async()=>original});expect(result[0]).toEqual({...original[0],offlineCached:true});expect(original[0].offlineCached).toBeUndefined()});
it('returns No data error when there has never been a successful response',async()=>{await expect(fetchAirWithOffline('/api/air',{fetcher:vi.fn().mockRejectedValue(new Error()),read:async()=>null})).rejects.toThrow('No air data available')});
it('saves successful responses and tolerates unavailable storage',async()=>{const write=vi.fn().mockRejectedValue(new Error('quota'));const result=await fetchAirWithOffline('/api/air',{fetcher:vi.fn().mockResolvedValue(new Response(JSON.stringify(original))),write});expect(write).toHaveBeenCalledWith('/api/air',original);expect(result[0].offlineCached).toBeUndefined();expect(result[0].aqi).toBe(0)});
it('uses original payload after HTTP errors rather than inventing a response',async()=>{const result=await fetchAirWithOffline('/api/air',{fetcher:vi.fn().mockResolvedValue(new Response(null,{status:429})),read:async()=>original});expect(result[0].offlineCached).toBe(true)});
