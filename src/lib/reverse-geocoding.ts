import type { Place } from './air';
export type ReversePlace = Place & { countryCode?: string; region?: string; country?: string };
export function parseReversePlace(raw: unknown, lat: number, lon: number): ReversePlace | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : undefined;
  const city = text(r.city) ?? text(r.locality), region = text(r.principalSubdivision), country = text(r.countryName);
  if (!city && !region && !country) return null;
  return { lat, lon, name: [...new Set([city, region, country].filter(Boolean))].join(', '), region, country,
    countryCode: typeof r.countryCode === 'string' && /^[A-Z]{2}$/.test(r.countryCode) ? r.countryCode : undefined };
}
