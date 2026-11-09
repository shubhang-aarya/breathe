import {expect,it} from 'vitest';
import {parseIQAir} from './iqair';
import {reportedFresh,selectReportedAQI} from './reported-aqi';
// Contract fixtures, never production readings.
const now=Date.parse('2026-11-09T07:00:00Z');
const fixture=(aqius:unknown=0,ts='2026-11-09T06:30:00Z',coordinates:unknown=[80.6,23.12])=>({status:'success',data:{city:'Fixture city',state:'Fixture state',country:'Fixture country',location:{coordinates},current:{pollution:{aqius,ts}}}});
it('preserves zero, reads longitude before latitude, and leaves pollutant values missing',()=>{const r=parseIQAir(fixture(),23.12,80.6,now)!;expect(r.aqi).toBe(0);expect(r.scope).toBe('city');expect(r.distanceKm).toBeCloseTo(0);expect(r.subindices).toEqual({});expect(reportedFresh(r,now)).toBe(true)});
it('preserves reported values over 500 instead of inventing a cap',()=>expect(parseIQAir(fixture(650),23.12,80.6,now)?.aqi).toBe(650));
it.each([null,{},fixture('42'),fixture(-1),fixture(Infinity),fixture(42,'bad'),fixture(42,'2026-11-09T06:30:00'),fixture(42,undefined,[80.6,100]),{status:'fail',data:{message:'call_limit_reached'}}])('rejects unusable reports',raw=>expect(parseIQAir(raw,23.12,80.6,now)).toBeNull());
it('does not turn old or future observations live by fetching them now',()=>{for(const ts of ['2026-11-07T06:30:00Z','2026-11-10T06:30:00Z'])expect(reportedFresh(parseIQAir(fixture(42,ts),23.12,80.6,now)!,now)).toBe(false)});
it('prefers fresh nearby sources over distant or stale reports regardless of provider',()=>{const r=parseIQAir(fixture(),23.12,80.6,now)!;const far={...r,distanceKm:685},stale={...r,observedAt:'2026-11-07T06:30:00Z'};expect(selectReportedAQI([far,r,stale],now)).toEqual(r);expect(selectReportedAQI([stale,far],now)).toEqual(far)});
