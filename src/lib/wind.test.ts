import { expect,it } from 'vitest';
import { advect,parseWind,windGrid } from './wind';
it('keeps the grid bounded and maps actual provider rows only',()=>{expect(windGrid).toHaveLength(40);expect(parseWind([{current:{wind_speed_10m:0,wind_direction_10m:0,time:'2026-11-08T12:00'}}])[0].speed).toBe(0);expect(parseWind([{current:{wind_speed_10m:null,wind_direction_10m:0,time:'x'}}])).toEqual([])});
it('interprets meteorological FROM bearings correctly',()=>{expect(advect(0,0,36,0,3600).lat).toBeLessThan(0);expect(advect(0,0,36,90,3600).lon).toBeLessThan(0)});
it('does not move calm air and wraps dateline crossings',()=>{expect(advect(0,0,0,0,3600)).toEqual({lat:0,lon:0});const p=advect(0,179.9,100,270,100000);expect(p.lon).toBeGreaterThanOrEqual(-180);expect(p.lon).toBeLessThan(180)});
