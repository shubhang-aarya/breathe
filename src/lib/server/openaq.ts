import 'server-only';
import { unstable_cache } from 'next/cache';
import { nearestStation,parseMeasurements,distanceKm,stationLicenses,type StationData } from '@/lib/openaq';
import { providerFetch } from './retry';
import { collectOpenAQPages } from '@/lib/openaq-pages';
async function requestStation(lat:number,lon:number):Promise<StationData|null>{
 const key=process.env.OPENAQ_API_KEY;if(!key)throw new Error('Station provider is not configured');
 const get=async(path:string)=>{const response=await providerFetch(`https://api.openaq.org/v3${path}`,{headers:{'X-API-Key':key},cache:'no-store'});return response.json()};
 const locations=await collectOpenAQPages(`/locations?coordinates=${lat},${lon}&radius=25000`,get);
 const station=nearestStation(locations,lat,lon);if(!station||distanceKm(lat,lon,station.coordinates.latitude,station.coordinates.longitude)>25)return null;
 const latest=await collectOpenAQPages(`/locations/${station.id}/latest`,get);
 return {id:station.id,name:station.name??`Station ${station.id}`,lat:station.coordinates.latitude,lon:station.coordinates.longitude,distanceKm:distanceKm(lat,lon,station.coordinates.latitude,station.coordinates.longitude),provider:station.provider?.name??'Provider not supplied',licenses:stationLicenses(station.licenses),owner:station.owner?.name,values:parseMeasurements(station,latest),fetchedAt:new Date().toISOString(),source:'OpenAQ v3'};
}
export const fetchStation=unstable_cache(requestStation,['openaq-station-v2'],{revalidate:900});
