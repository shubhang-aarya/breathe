import { filterStations, type RadioResult } from './radio';
export async function findRadio(lat: number, lon: number, countryCode: string | undefined, region: string | undefined, request: (path: string) => Promise<unknown>): Promise<RadioResult> {
  const search = async (extra: Record<string, string>) => filterStations(await request('/json/stations/search?' + new URLSearchParams({ hidebroken: 'true', is_https: 'true', order: 'votes', reverse: 'true', limit: '80', ...extra }))).slice(0, 20);
  const result = (stations: RadioResult['stations'], scope: RadioResult['scope']): RadioResult => ({ stations, scope, fetchedAt: new Date().toISOString(), source: 'Radio Browser' });
  const nearby = await search({ geo_lat: String(lat), geo_long: String(lon), geo_distance: '150000' });
  if (nearby.length) return result(nearby, 'nearby');
  if (countryCode && region) {
    const state = await search({ countrycode: countryCode, state: region, stateExact: 'true' });
    if (state.length) return result(state, 'state');
  }
  if (countryCode) {
    const country = await search({ countrycode: countryCode });
    if (country.length) return result(country, 'country');
  }
  return result(await search({ geo_lat: String(lat), geo_long: String(lon), geo_distance: '1500000' }), 'regional');
}
