import { expect, it, vi } from 'vitest';
import { fetchSnapshot } from './offline-snapshot';
it('preserves original source and timestamps while explicitly marking failed-response fallbacks stale', async () => {
 const data={source:'OpenAQ v3',fetchedAt:'2026-11-08T12:00:00Z',station:{values:[{value:0}]}};
 const response=await fetchSnapshot('/api/station',{fetcher:vi.fn().mockResolvedValue(new Response(null,{status:429})),read:async()=>data});
 expect(response).toEqual({...data,offlineCached:true});expect(data).not.toHaveProperty('offlineCached');
});
it('does not create an offline response when nothing was stored',async()=>{
 await expect(fetchSnapshot('/api/diwali',{fetcher:vi.fn().mockRejectedValue(new Error()),read:async()=>null})).rejects.toThrow('No saved data');
});
