import { expect,it } from 'vitest';
import { grid,gridBatchCount,gridBatchSize } from './sampling';
import { pastDay } from './trends';
import type { Air } from './air';
it('samples unique valid global coordinates in bounded batches',()=>{expect(grid).toHaveLength(84);expect(new Set(grid.map(p=>`${p.lat},${p.lon}`)).size).toBe(84);expect(grid.every(p=>Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180)).toBe(true);expect(gridBatchCount*gridBatchSize).toBe(grid.length)});
it('keeps gaps in the historical chart and excludes future hours',()=>{const air={observedAt:'2026-11-08T12:00:00Z',hours:[{time:'2026-11-08T11:00:00Z',aqi:null},{time:'2026-11-08T12:00:00Z',aqi:0},{time:'2026-11-08T13:00:00Z',aqi:10}]} as Air;expect(pastDay(air).map(h=>h.aqi)).toEqual([null,0])});
