import { expect, it } from 'vitest';
import { isFreshAir, extractAssistantText, summarizeAir } from './air-summary';
import { evaluateAlert } from './alerts';
import type { Air } from './air';
const now = Date.parse('2026-11-08T12:00:00Z');
const air = { place: { name: 'Test', lat: 0, lon: 0 }, aqi: 0, observedAt: '2026-11-08T12:00:00Z', fetchedAt: '2026-11-08T12:00:00Z', source: 'Open-Meteo · CAMS', kind: 'MODELED', hours: [], pollutants: {} } as unknown as Air;
it('does not alert for missing, stale, future or cached data', () => {
  for (const value of [undefined, { ...air, aqi: null }, { ...air, offlineCached: true }, { ...air, observedAt: '2026-11-09T12:00:00Z' }, { ...air, observedAt: '2026-11-07T12:00:00Z' }]) expect(evaluateAlert(value, 0, undefined, now)).toBeNull();
  expect(isFreshAir(air, now)).toBe(true);
});
it('alerts on initial exceedance and re-crossing, preserving zero and suppressing duplicates', () => {
  const first = evaluateAlert(air, 0, undefined, now)!;
  expect(first.alert).toBe(true);
  expect(evaluateAlert(air, 0, first.marker, now)?.alert).toBe(false);
  expect(evaluateAlert({ ...air, aqi: 101 }, 100, { ...first.marker, threshold: 100, above: false }, now)?.alert).toBe(true);
});
it('summaries preserve unavailable history', () => {
  expect(summarizeAir(air).recentMean).toBeNull();
  expect(summarizeAir(air).category).toBe('Good');
  expect(summarizeAir({ ...air, aqi: null }).text).toMatch(/No current AQI/);
});
it('rejects AI quantities and tolerates malformed responses', () => {
  expect(extractAssistantText({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'AQI is 999.' }] }] })).toBeNull();
  expect(extractAssistantText({ output: [] })).toBeNull();
  expect(extractAssistantText({output:[{type:'message',content:[{type:'output_text',text:'The index is nine hundred.'}]}]})).toBeNull();
  expect(extractAssistantText({ output: [null, 7, {type:'message',content:[null]}] })).toBeNull();
  expect(extractAssistantText({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'The modeled category is Good.' }] }] })).toBe('The modeled category is Good.');
});
