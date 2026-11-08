import { expect, it } from 'vitest';
import { reportHtml, exportRows } from './export-air';
import type { Air } from './air';
const air = { place: { name: '<script>bad</script>', lat: 0, lon: 0 }, aqi: 0, observedAt: '2026-11-08T12:00:00Z', fetchedAt: '2026-11-08T12:00:00Z', source: 'Open-Meteo · CAMS', pollutants: {}, hours: [{ time: '2026-11-08T12:00:00Z', aqi: 0, pm25: null }, { time: '2026-11-09T12:00:00Z', aqi: 99, pm25: null }] } as unknown as Air;
it('escapes place names and preserves zero, timestamps and stale labeling in reports', () => {
  const html = reportHtml(air, Date.parse('2026-11-09T12:00:00Z'));
  expect(html).not.toContain('<script>bad'); expect(html).toContain('&lt;script&gt;'); expect(html).toContain('US AQI 0.0'); expect(html).toContain('STALE · Not live'); expect(html).toContain(air.fetchedAt);
});
it('excludes forecast rows from historical report summaries', () => { expect(exportRows(air)).toHaveLength(1); expect(exportRows(air)[0].aqi).toBe(0); });
