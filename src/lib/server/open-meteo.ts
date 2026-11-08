import 'server-only';
import { providerFetch } from './retry';
import { unstable_cache } from 'next/cache';
import { finite, pollutants, type Air, type Place } from '@/lib/air';
// Next's persistent Data Cache works across serverless invocations. Failed revalidation
// preserves its prior response; observation timestamps are surfaced to the client.
async function requestAir(places:Place[]):Promise<Air[]>{
 const params=new URLSearchParams({latitude:places.map(p=>p.lat.toFixed(3)).join(','),longitude:places.map(p=>p.lon.toFixed(3)).join(','),current:['us_aqi',...pollutants].join(','),hourly:'us_aqi,pm2_5',past_days:'1',forecast_days:'5',timezone:'GMT'});
 const response=await providerFetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,{cache:'no-store'});
 const raw:unknown=await response.json();const rows=Array.isArray(raw)?raw:[raw];
 if(rows.length!==places.length)throw new Error('Incomplete provider response');
 const fetchedAt=new Date().toISOString();
 return rows.map((rawRow,index)=>{
  const row=rawRow as {current?:Record<string,unknown>;hourly?:{time?:unknown[];us_aqi?:unknown[];pm2_5?:unknown[]}};
  if(!row||typeof row!=='object')throw new Error('Invalid provider response');
  const current=row.current;const observedAt=typeof current?.time==='string'?`${current.time}Z`:null;
  return {place:places[index],aqi:finite(current?.us_aqi),pollutants:Object.fromEntries(pollutants.map(key=>[key,finite(current?.[key])])) as Air['pollutants'],observedAt,fetchedAt,source:'Open-Meteo · CAMS',kind:'MODELED',hours:(row.hourly?.time??[]).flatMap((time,i)=>typeof time==='string'?[{time:`${time}Z`,aqi:finite(row.hourly?.us_aqi?.[i]),pm25:finite(row.hourly?.pm2_5?.[i])}]:[])};
 });
}

// Cache the normalized payload, preserving its original retrieval timestamp.
export const fetchAir=unstable_cache(requestAir,['cams-air-v2'],{revalidate:900});
