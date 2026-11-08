import { isFreshAir } from './air-summary';
import { coordinateKey, type Air } from './air';
export type AlertMarker = { key: string; time: string; threshold: number; above: boolean };
export function evaluateAlert(air: Air | undefined, threshold: number, previous: AlertMarker | undefined, now = Date.now()) {
  if (!air || air.aqi === null || !isFreshAir(air, now) || !Number.isFinite(threshold) || threshold < 0 || threshold > 500) return null;
  const key = coordinateKey(air.place), time = air.observedAt!;
  if (previous?.key === key && Date.parse(previous.time) > Date.parse(time)) return null;
  const above = air.aqi >= threshold;
  const marker = { key, time, threshold, above };
  const alert = above && (!previous || previous.key !== key || previous.threshold !== threshold || !previous.above);
  return { marker, alert };
}
