import { expect, it, vi } from 'vitest';
import { collectOpenAQPages } from './openaq-pages';
import { stationLicenses } from './openaq';
it('collects every page before nearest-station selection',async()=>{
 const first=Array.from({length:1000},(_,id)=>({id}));
 const get=vi.fn().mockResolvedValueOnce({meta:{found:1001},results:first}).mockResolvedValueOnce({meta:{found:1001},results:[{id:1000}]});
 expect(await collectOpenAQPages('/locations?radius=25000',get)).toHaveLength(1001);expect(get.mock.calls[1][0]).toContain('page=2');
});
it('refuses partial-directory nearest-station claims when the budget is exceeded',async()=>{
 const get=vi.fn().mockResolvedValue({meta:{found:5000},results:Array.from({length:1000},(_,id)=>({id}))});
 await expect(collectOpenAQPages('/locations',get,1)).rejects.toThrow('no partial');
});
it('preserves license metadata as text and only emits safe attribution links',()=>{
 expect(stationLicenses([{name:'Public domain',attribution:{name:'Provider',url:'javascript:alert(1)'},dateFrom:'2026-01-01'}])[0]).toEqual({name:'Public domain',attribution:'Provider',url:null,dateFrom:'2026-01-01',dateTo:null});
});
