import { expect,it } from 'vitest';
import { daily,mean,percentChange,range,spikes } from './analytics';
it('preserves zero and omits missing/nonfinite values',()=>{expect(mean([null,undefined,NaN,0,10])).toBe(5);expect(mean([null])).toBeNull()});
it('does not invent a percentage with absent or zero baseline',()=>{expect(percentChange(0,10)).toBeNull();expect(percentChange(null,10)).toBeNull();expect(percentChange(100,75)).toBe(-25)});
it('reports partial daily coverage and independent pollutant averages',()=>{expect(daily([{time:'2026-11-08T00:00:00Z',aqi:0,pm25:null,pm10:10},{time:'2026-11-08T01:00:00Z',aqi:20,pm25:10,pm10:20}])[0]).toEqual({date:'2026-11-08',aqi:10,pm25:10,pm10:15,hours:2})});
it('detects spikes against preceding values without including the spike',()=>{const rows=Array.from({length:8},(_,i)=>({time:`2026-11-08T0${i}:00:00Z`,aqi:i===7?100:10,pm25:null}));expect(spikes(rows)[7].spike).toBe(true);expect(spikes(rows)[5].spike).toBe(false)});
it('rejects reversed and malformed ranges',()=>{expect(range([],'2026-11-09','2026-11-08')).toEqual([]);expect(range([],'invalid','2026-11-08')).toEqual([])});
