import type { Air } from './air';
export type WeatherHour = { time: string; temperature: number | null; humidity: number | null; wind: number | null };
export type Estimate = {
  available: boolean; reason?: string; predictions: { time: string; aqi: number }[];
  mae: number | null; baselineMae: number | null; trainingHours: number; validationHours: number;
  validationStart: string | null; validationEnd: string | null; trainedThrough: string | null;
};
type Sample = { time: string; x: number[]; y: number; baseline: number };
const hourMs = 3600000;
function features(weather: WeatherHour | undefined, lag: number | null | undefined): number[] | null {
  if (!weather || lag == null || !Number.isFinite(lag) || weather.temperature == null || weather.humidity == null || weather.wind == null || !Number.isFinite(weather.temperature) || !Number.isFinite(weather.humidity) || !Number.isFinite(weather.wind)) return null;
  const time = Date.parse(weather.time); if (!Number.isFinite(time)) return null;
  const phase = new Date(time).getUTCHours() * 2 * Math.PI / 24;
  return [1, weather.temperature / 30, weather.humidity / 100, weather.wind / 50, Math.sin(phase), Math.cos(phase), lag / 100];
}
/** Small ridge regression solved by pivoted Gaussian elimination. No missing-value imputation. */
function fit(rows: Sample[]): number[] | null {
  const n = 7, matrix = Array.from({ length: n }, (_, i) => Array.from({ length: n + 1 }, (_, j) => j === n ? rows.reduce((sum, r) => sum + r.x[i] * r.y, 0) : rows.reduce((sum, r) => sum + r.x[i] * r.x[j], 0) + (i === j && i !== 0 ? 1 : 0)));
  for (let i = 0; i < n; i++) {
    let pivot = i; for (let j = i + 1; j < n; j++) if (Math.abs(matrix[j][i]) > Math.abs(matrix[pivot][i])) pivot = j;
    if (Math.abs(matrix[pivot][i]) < 1e-10) return null;
    [matrix[i], matrix[pivot]] = [matrix[pivot], matrix[i]];
    const scale = matrix[i][i]; for (let j = i; j <= n; j++) matrix[i][j] /= scale;
    for (let k = 0; k < n; k++) if (k !== i) { const factor = matrix[k][i]; for (let j = i; j <= n; j++) matrix[k][j] -= factor * matrix[i][j]; }
  }
  const coefficients = matrix.map(row => row[n]); return coefficients.every(Number.isFinite) ? coefficients : null;
}
function predict(coefficients: number[], x: number[]) { return Math.max(0, coefficients.reduce((sum, c, i) => sum + c * x[i], 0)); }
export function estimateAir(air: Air, weather: WeatherHour[], now = Date.now()): Estimate {
  const empty = (reason: string): Estimate => ({ available: false, reason, predictions: [], mae: null, baselineMae: null, trainingHours: 0, validationHours: 0, validationStart: null, validationEnd: null, trainedThrough: null });
  const cutoff = Math.min(Date.parse(air.observedAt ?? ''), now);
  if (!Number.isFinite(cutoff) || now - cutoff > 2 * hourMs || air.offlineCached) return empty('Fresh current model history is required.');
  const hours = new Map(air.hours.filter(h => Date.parse(h.time) <= cutoff && h.aqi != null && Number.isFinite(h.aqi)).map(h => [Date.parse(h.time), h]));
  const conditions = new Map(weather.map(w => [Date.parse(w.time), w]));
  const samples: Sample[] = [...hours].sort(([a], [b]) => a - b).flatMap(([time, h]) => {
    const lag = hours.get(time - 24 * hourMs)?.aqi, x = features(conditions.get(time), lag);
    return x && lag != null ? [{ time: h.time, x, y: h.aqi!, baseline: lag }] : [];
  });
  if (samples.length < 96) return empty('At least 96 complete AQI/weather pairs with a preceding-day AQI are needed. Missing hours are not filled.');
  const validation = samples.slice(-24), train = samples.slice(0, -24), model = fit(train);
  if (!model) return empty('The available data cannot support a stable fit.');
  const mae = validation.reduce((sum, row) => sum + Math.abs(predict(model, row.x) - row.y), 0) / validation.length;
  const baselineMae = validation.reduce((sum, row) => sum + Math.abs(row.baseline - row.y), 0) / validation.length;
  // Validation is chronological and completed before refitting on all available past data.
  const final = fit(samples); if (!final) return empty('Model refitting failed.');
  const start = Math.floor(cutoff / hourMs) * hourMs;
  const predictions = Array.from({ length: 6 }, (_, i) => start + (i + 1) * hourMs).flatMap(time => {
    const x = features(conditions.get(time), hours.get(time - 24 * hourMs)?.aqi);
    if (!x) return [];
    const aqi = predict(final, x); return Number.isFinite(aqi) ? [{ time: new Date(time).toISOString(), aqi: Math.round(aqi * 10) / 10 }] : [];
  });
  if (!predictions.length) return empty('Future weather or preceding-day AQI is missing.');
  return { available: true, predictions, mae, baselineMae, trainingHours: train.length, validationHours: validation.length, validationStart: validation[0].time, validationEnd: validation.at(-1)!.time, trainedThrough: samples.at(-1)!.time };
}
