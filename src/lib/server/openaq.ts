import 'server-only';
import { unstable_cache } from 'next/cache';
import { nearestStation,parseMeasurements,distanceKm,type StationData } from '@/lib/openaq';
import { providerFetch } from './retry';
async function requestStation(lat:number,lon:number):Promise<StationData|null>{
 const key=process.env.OPENAQ_API_KEY;if(!key)throw new Error('Station provider is not configured');
 const get=async(path:string)=>{const response=await providerFetch(`https://api.openaq.org/v3${path}`,{headers:{'X-API-Key':key},cache:'no-store'});return response.json()};
 const locations=await get(`/locations?coordinates=${lat},${lon}&radius=25000&limit=1000`);if(!locations||!Array.isArray(locations.results))throw new Error('Invalid station directory');
 const station=nearestStation(locations.results,lat,lon);if(!station)return null;
 const latest=await get(`/locations/${station.id}/latest?limit=1000`);if(!Array.isArray(latest?.results))throw new Error('Invalid station readings');
 return {id:station.id,name:station.name??`Station ${station.id}`,lat:station.coordinates.latitude,lon:station.coordinates.longitude,distanceKm:distanceKm(lat,lon,station.coordinates.latitude,station.coordinates.longitude),provider:station.provider?.name??'Provider not supplied',values:parseMeasurements(station,latest.results),fetchedAt:new Date().toISOString(),source:'OpenAQ v3'};
}
export const fetchStation=unstable_cache(requestStation,['openaq-station-v1'],{revalidate:900});
