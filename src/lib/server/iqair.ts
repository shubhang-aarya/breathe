import 'server-only';
import { unstable_cache } from 'next/cache';
import { parseIQAir } from '@/lib/iqair';
import { providerFetch,ProviderError } from './retry';
import { recordProviderCooldown } from './quota';
const nearestCity=unstable_cache(async(lat:number,lon:number)=>{
 const key=process.env.IQAIR_API_KEY?.trim();if(!key)return null;
 const url=new URL('https://api.airvisual.com/v2/nearest_city');
 url.searchParams.set('lat',String(lat));url.searchParams.set('lon',String(lon));url.searchParams.set('key',key);
 const response=await providerFetch(url.href,{cache:'no-store'});
 const raw=await response.json();
 if(raw?.status!=='success'){
  if(raw?.data?.message==='call_limit_reached'){await recordProviderCooldown('iqair',60);throw new ProviderError(429,60);}
  throw new ProviderError(503,60);
 }
 return parseIQAir(raw,lat,lon);
},['iqair-nearest-city-v1'],{revalidate:900});
export async function getIQAir(lat:number,lon:number){
 if(!process.env.IQAIR_API_KEY?.trim())return null;
 // Cache key contains coordinates only. Credentials remain inside the server closure.
 const reading=await nearestCity(Number(lat.toFixed(3)),Number(lon.toFixed(3)));
 return reading;
}
