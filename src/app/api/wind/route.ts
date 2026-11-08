import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { windGrid,parseWind,type WindResult } from '@/lib/wind';
import { providerFetch } from '@/lib/server/retry';
const wind=unstable_cache(async():Promise<WindResult>=>{const p=new URLSearchParams({latitude:windGrid.map(p=>p.lat).join(','),longitude:windGrid.map(p=>p.lon).join(','),current:'wind_speed_10m,wind_direction_10m',wind_speed_unit:'kmh',timezone:'GMT'});const r=await providerFetch(`https://api.open-meteo.com/v1/forecast?${p}`,{cache:'no-store'});return {cells:parseWind(await r.json()),fetchedAt:new Date().toISOString(),source:'Open-Meteo Weather',kind:'MODELED'};},['wind-grid-v1'],{revalidate:1200});
export async function GET(){try{return NextResponse.json(await wind(),{headers:{'Cache-Control':'public, s-maxage=1200, stale-while-revalidate=600'}})}catch{return NextResponse.json({error:'Wind data is temporarily unavailable'},{status:503})}}
