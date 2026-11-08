import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { validCoordinates, finite } from '@/lib/air';
import { estimateAir, type WeatherHour } from '@/lib/estimate';
import { fetchAir } from '@/lib/server/open-meteo';
import { providerFetch } from '@/lib/server/retry';
export const runtime = 'nodejs';
const estimate = unstable_cache(async (lat: number, lon: number) => {
  const params = new URLSearchParams({ latitude: String(lat), longitude: String(lon), hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m', past_days: '7', forecast_days: '2', timezone: 'GMT' });
  const [rows, response] = await Promise.all([fetchAir([{ name: 'Selected coordinates', lat, lon }], true), providerFetch(`https://api.open-meteo.com/v1/forecast?${params}`, { cache: 'no-store' })]);
  const raw = await response.json(), fetchedAt = new Date().toISOString();
  const hourly = raw?.hourly;
  const weather: WeatherHour[] = Array.isArray(hourly?.time) ? hourly.time.flatMap((time: unknown, i: number) => typeof time === 'string' ? [{ time: `${time}Z`, temperature: typeof hourly.temperature_2m?.[i] === 'number' && Number.isFinite(hourly.temperature_2m[i]) ? hourly.temperature_2m[i] : null, humidity: finite(hourly.relative_humidity_2m?.[i]), wind: finite(hourly.wind_speed_10m?.[i]) }] : []) : [];
  const air = rows[0];
  return { ...estimateAir(air, weather), source: 'BREATHE ridge regression · Open-Meteo CAMS + Weather', airObservedAt: air.observedAt, airFetchedAt: air.fetchedAt, weatherFetchedAt: fetchedAt, fetchedAt, kind: 'ML ESTIMATE' };
}, ['ml-estimate-v1'], { revalidate: 1200 });
export async function GET(request: NextRequest) {
  const a = request.nextUrl.searchParams.get('lat'), b = request.nextUrl.searchParams.get('lon');
  if (!a?.trim() || !b?.trim() || !validCoordinates(Number(a), Number(b))) return NextResponse.json({ error: 'Valid coordinates are required.' }, { status: 400 });
  try { return NextResponse.json(await estimate(Number(Number(a).toFixed(3)), Number(Number(b).toFixed(3))), { headers: { 'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600' } }); }
  catch { return NextResponse.json({ error: 'No estimate is available. Historical air or weather data could not be loaded.' }, { status: 503 }); }
}
