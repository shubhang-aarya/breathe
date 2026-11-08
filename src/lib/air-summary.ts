import { category, type Air } from './air';
import { mean, percentChange } from './analytics';
import { guidance } from './perspective';

export function isFreshAir(air: Air | undefined, now = Date.now()) {
  const time = Date.parse(air?.observedAt ?? '');
  return !!air && !air.offlineCached && Number.isFinite(time) && time <= now + 15 * 60000 && now - time < 2 * 3600000;
}

export function summarizeAir(air: Air) {
  const end = Date.parse(air.observedAt ?? '');
  const history = air.hours.filter(h => Date.parse(h.time) <= end);
  const recent = mean(history.filter(h => Date.parse(h.time) > end - 24 * 3600000).map(h => h.aqi));
  const previous = mean(history.filter(h => Date.parse(h.time) > end - 48 * 3600000 && Date.parse(h.time) <= end - 24 * 3600000).map(h => h.aqi));
  const change = percentChange(previous, recent);
  return {
    category: category(air.aqi),
    text: air.aqi === null ? 'No current AQI is available for this location.' : `The modeled air quality category is ${category(air.aqi)}. ${guidance(air.aqi)}`,
    recentMean: recent,
    previousMean: previous,
    change,
    trend: change === null ? 'No comparable trend' : Math.abs(change) < 1 ? 'Little change' : change > 0 ? 'Higher than the preceding day' : 'Lower than the preceding day',
    hours: history.filter(h => Date.parse(h.time) > end - 24 * 3600000 && h.aqi !== null).length,
  };
}

/** Generated prose carries no quantities: the UI renders trusted numeric data separately. */
export function extractAssistantText(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object' || !('output' in raw) || !Array.isArray(raw.output)) return null;
  const text = raw.output.flatMap((item: { type?: string; content?: { type?: string; text?: string }[] }) =>
    item?.type === 'message' && Array.isArray(item.content) ? item.content.filter(c => c.type === 'output_text' && typeof c.text === 'string').map(c => c.text!) : []
  ).join('\n').trim();
  return text && text.length <= 4000 && !/\d/.test(text) ? text : null;
}
