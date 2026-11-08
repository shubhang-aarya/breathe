import 'server-only';
import { unstable_cache } from 'next/cache';
import { providerFetch } from './retry';
import { parseReversePlace } from '@/lib/reverse-geocoding';
export const reversePlace = unstable_cache(async (lat: number, lon: number) => {
  const key = process.env.BIGDATACLOUD_API_KEY;
  if (!key) return null;
  const params = new URLSearchParams({ latitude: String(lat), longitude: String(lon), localityLanguage: 'en', key });
  // The keyed server endpoint permits arbitrary pins. The free client-only endpoint does not.
  const response = await providerFetch(`https://api-bdc.net/data/reverse-geocode?${params}`, { cache: 'no-store' });
  const place = parseReversePlace(await response.json(), lat, lon);
  return place ? { place, source: 'BigDataCloud', fetchedAt: new Date().toISOString() } : null;
}, ['reverse-city-v1'], { revalidate: 1800 });
