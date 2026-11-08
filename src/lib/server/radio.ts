import 'server-only';
import { resolve4,reverse } from 'node:dns/promises';
import { unstable_cache } from 'next/cache';
import { findRadio } from '@/lib/radio-discovery';
import { providerFetch, ProviderError } from './retry';
import { reversePlace } from './reverse-geocoding';
const agent='BREATHE/0.1 (Lets Code Diwali Challenge 2026; local-radio discovery)';
const hosts=unstable_cache(async()=>{try{const ips=await resolve4('all.api.radio-browser.info');const names=(await Promise.allSettled(ips.slice(0,8).map(ip=>reverse(ip)))).flatMap(r=>r.status==='fulfilled'?r.value:[]).filter(h=>/^[a-z0-9-]+\.api\.radio-browser\.info$/.test(h));return [...new Set([...names,'de1.api.radio-browser.info','at1.api.radio-browser.info'])].sort(()=>Math.random()-.5)}catch{return ['de1.api.radio-browser.info','at1.api.radio-browser.info']}},['radio-mirrors'],{revalidate:1800});
export async function radioRequest(path:string){
 for(const host of (await hosts()).slice(0,2)){
  try{return await (await providerFetch(`https://${host}${path}`,{headers:{'User-Agent':agent},cache:'no-store'})).json()}
  catch(error){if(error instanceof ProviderError&&error.status===429)throw error;}
 }
 throw new Error('Radio directory is temporarily unavailable');
}
export const discoverRadio=unstable_cache(async(lat:number,lon:number,countryCode?:string,region?:string)=>{
 if(!countryCode){try{const resolved=await reversePlace(lat,lon);countryCode=resolved?.place.countryCode;region=resolved?.place.region}catch{/* Geographic fallback remains available. */}}
 return findRadio(lat,lon,countryCode,region,radioRequest);
},['radio-discovery-v2'],{revalidate:1200});
