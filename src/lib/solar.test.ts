import { expect,it } from 'vitest';
import { subsolarPoint } from './solar';
it('places the subsolar latitude near the equator at the equinox',()=>{expect(Math.abs(subsolarPoint(Date.parse('2026-03-20T12:00:00Z')).lat)).toBeLessThan(1);expect(Math.abs(subsolarPoint(Date.parse('2026-03-20T12:00:00Z')).lon)).toBeLessThan(3)});
it('tracks northern and southern solstices',()=>{expect(subsolarPoint(Date.parse('2026-06-21T12:00:00Z')).lat).toBeGreaterThan(23);expect(subsolarPoint(Date.parse('2026-12-21T12:00:00Z')).lat).toBeLessThan(-23)});
it('moves about 90 degrees west over six UTC hours',()=>{const a=subsolarPoint(Date.parse('2026-06-21T06:00:00Z')),b=subsolarPoint(Date.parse('2026-06-21T12:00:00Z'));expect(a.lon-b.lon).toBeCloseTo(90,0)});
it('supports leap years and rejects invalid times',()=>{const p=subsolarPoint(Date.parse('2028-02-29T23:00:00Z'));expect(Number.isFinite(p.lat)&&Math.abs(p.lon)<=180).toBe(true);expect(()=>subsolarPoint(NaN)).toThrow()});
