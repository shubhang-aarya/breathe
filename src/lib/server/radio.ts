import 'server-only';
import { resolve4,reverse } from 'node:dns/promises';
import { unstable_cache } from 'next/cache';
import { filterStations,type RadioResult } from '@/lib/radio';
const agent='BREATHE/0.1 (Lets Code Diwali Challenge 2026; local-radio discovery)';
const hosts=unstable_cache(async()=>{try{const ips=await resolve4('all.api.radio-browser.info');const names=(await Promise.allSettled(ips.slice(0,8).map(ip=>reverse(ip)))).flatMap(r=>r.status==='fulfilled'?r.value:[]).filter(h=>/^[a-z0-9-]+\.api\.radio-browser\.info$/.test(h));return [...new Set([...names,'de1.api.radio-browser.info','at1.api.radio-browser.info'])].sort(()=>Math.random()-.5)}catch{return ['de1.api.radio-browser.info','at1.api.radio-browser.info']}},['radio-mirrors'],{revalidate:1800});
export async function radioRequest(path:string){for(const host of (await hosts()).slice(0,4)){try{const response=await fetch(`https://${host}${path}`,{headers:{'User-Agent':agent},cache:'no-store',signal:AbortSignal.timeout(6000)});if(response.ok)return await response.json();if(response.status===429)await new Promise(resolve=>setTimeout(resolve,800));}catch{/* Try the next discovered mirror. */}}throw new Error('Radio directory is temporarily unavailable')}
export const discoverRadio=unstable_cache(async(lat:number,lon:number):Promise<RadioResult>=>{
 const search=async(distance:number)=>filterStations(await radioRequest('/json/stations/search?'+new URLSearchParams({geo_lat:String(lat),geo_long:String(lon),geo_distance:String(distance),hidebroken:'true',is_https:'true',order:'votes',reverse:'true',limit:'80'}))).slice(0,20);
 const nearby=await search(150000);if(nearby.length)return {stations:nearby,scope:'nearby',fetchedAt:new Date().toISOString(),source:'Radio Browser'};
 return {stations:await search(1500000),scope:'regional',fetchedAt:new Date().toISOString(),source:'Radio Browser'};
},['radio-discovery-v1'],{revalidate:1200});
