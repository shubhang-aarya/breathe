import 'server-only';
import { unstable_cache } from 'next/cache';
import { nearestRecentStation,parseMeasurements,distanceKm,stationLicenses,type StationData } from '@/lib/openaq';
import { providerFetch } from './retry';
import { measuredParticleIndex,parseMeasuredHours } from '@/lib/particle-aqi';
import { collectOpenAQPages } from '@/lib/openaq-pages';
async function requestStation(lat:number,lon:number):Promise<StationData|null>{
 const key=process.env.OPENAQ_API_KEY;if(!key)throw new Error('Station provider is not configured');
 const get=async(path:string)=>{const response=await providerFetch(`https://api.openaq.org/v3${path}`,{headers:{'X-API-Key':key},cache:'no-store'});return response.json()};
 const now=Date.now();
 const locations=await collectOpenAQPages(`/locations?coordinates=${lat},${lon}&radius=25000`,get);
 const station=nearestRecentStation(locations,lat,lon,now);if(!station||distanceKm(lat,lon,station.coordinates.latitude,station.coordinates.longitude)>25)return null;
 const latest=await collectOpenAQPages(`/locations/${station.id}/latest`,get);
 const values=parseMeasurements(station,latest);
 const particles=values.filter(v=>['pm25','pm2.5','pm10'].includes(v.parameter)&&now-Date.parse(v.observedAt)<=2*3600000&&Date.parse(v.observedAt)<=now).filter((v,i,rows)=>rows.findIndex(r=>r.parameter===v.parameter)===i).slice(0,2);
 const series:Partial<Record<'pm25'|'pm10',ReturnType<typeof parseMeasuredHours>>>={};
 let indexUnavailableReason='No recent particle observations are available. Old station readings are not live.';
 if(particles.length){
  const start=new Date(Math.floor(now/3600000)*3600000-13*3600000).toISOString(),end=new Date(now).toISOString();
  const results=await Promise.allSettled(particles.map(async sensor=>{const particle=sensor.parameter==='pm10'?'pm10':'pm25';const params=new URLSearchParams({datetime_from:start,datetime_to:end,limit:'1000'});const raw=await get(`/sensors/${sensor.sensorId}/hours?${params}`);return {particle:particle as 'pm25'|'pm10',hours:parseMeasuredHours(raw.results,particle)};}));
  for(const result of results)if(result.status==='fulfilled')series[result.value.particle]=result.value.hours;
  indexUnavailableReason='Insufficient valid recent hourly observations for a particle NowCast. At least two of the latest three completed hours are required.';
 }
 const particleIndex=measuredParticleIndex(series,now);

 return {id:station.id,name:station.name??`Station ${station.id}`,lat:station.coordinates.latitude,lon:station.coordinates.longitude,distanceKm:distanceKm(lat,lon,station.coordinates.latitude,station.coordinates.longitude),provider:station.provider?.name??'Provider not supplied',licenses:stationLicenses(station.licenses),owner:station.owner?.name,particleIndex,indexUnavailableReason:particleIndex?undefined:indexUnavailableReason,values,fetchedAt:new Date().toISOString(),source:'OpenAQ v3'};
}
export const fetchStation=unstable_cache(requestStation,['openaq-station-nowcast-v1'],{revalidate:600});
