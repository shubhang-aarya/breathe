import { expect, it } from 'vitest';
import { estimateAir, type WeatherHour } from './estimate';
import type { Air } from './air';
const now = Date.parse('2026-11-08T12:00:00Z');
function fixture() {
  const hours = Array.from({ length: 175 }, (_, i) => ({ time: new Date(now - (168 - i) * 3600000).toISOString(), aqi: 40 + i / 10, pm25: null }));
  const weather: WeatherHour[] = hours.map(h => ({ time: h.time, temperature: 20, humidity: 60, wind: 10 }));
  const air = { observedAt: new Date(now).toISOString(), hours, aqi: 56, offlineCached: false } as Air;
  return { air, weather };
}
it('rejects missing and stale training data without estimates', () => {
  const { air, weather } = fixture();
  expect(estimateAir({ ...air, hours: [] }, weather, now).available).toBe(false);
  expect(estimateAir({ ...air, offlineCached: true }, weather, now).predictions).toEqual([]);
});
it('validates chronologically and excludes future AQI from fitting', () => {
  const { air, weather } = fixture(), result = estimateAir(air, weather, now);
  expect(result.available).toBe(true); expect(result.validationHours).toBe(24); expect(result.predictions).toHaveLength(6);
  expect(Date.parse(result.validationStart!)).toBeLessThanOrEqual(Date.parse(result.trainedThrough!));
  expect(result.predictions.every(p => Date.parse(p.time) > now)).toBe(true);
  expect(Number.isFinite(result.mae)).toBe(true); expect(Number.isFinite(result.baselineMae)).toBe(true);
  const changed = { ...air, hours: air.hours.map(h => Date.parse(h.time) > now ? { ...h, aqi: 999 } : h) };
  expect(estimateAir(changed, weather, now)).toEqual(result);
});
it('does not invent missing future weather or lag inputs', () => {
  const { air, weather } = fixture();
  expect(estimateAir(air, weather.filter(w => Date.parse(w.time) <= now), now).available).toBe(false);
});
