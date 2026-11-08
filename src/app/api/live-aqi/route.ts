import { NextRequest,NextResponse } from 'next/server';
import { validCoordinates } from '@/lib/air';
import { distanceKm } from '@/lib/openaq';
import { parseReportedAQI,reportedFresh } from '@/lib/reported-aqi';
import { providerFetch,ProviderError } from '@/lib/server/retry';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store, max-age=0','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store'};
export async function GET(request:NextRequest){
 const p=request.nextUrl.searchParams,a=p.get('lat'),b=p.get('lon'),lat=Number(a),lon=Number(b);
 if(a===null||b===null||!a.trim()||!b.trim()||!validCoordinates(lat,lon))return NextResponse.json({error:'Valid coordinates are required'},{status:400,headers});
 const token=process.env.WAQI_API_TOKEN;if(!token)return NextResponse.json({status:'unconfigured'},{headers});
 try{
  const get=async(path:string,params:Record<string,string>={})=>{const url=new URL(`https://api.waqi.info${path}`);for(const [key,value]of Object.entries(params))url.searchParams.set(key,value);url.searchParams.set('token',token);const response=await providerFetch(url.href,{cache:'no-store'});return response.json();};
  const raw=await get(`/feed/geo:${lat.toFixed(4)};${lon.toFixed(4)}/`);
  let reading=parseReportedAQI(raw,lat,lon);
  if(!reading||!reportedFresh(reading,Date.now())){
   // Some coordinates return no usable geo feed. Discover bounded regional candidates,
   // then fetch full station feeds; map AQIs alone lack the required provenance/time.
   const dy=500/110,dx=Math.min(180,500/(110*Math.max(.01,Math.cos(lat*Math.PI/180))));
   const bounds=[Math.max(-90,lat-dy),Math.max(-180,lon-dx),Math.min(90,lat+dy),Math.min(180,lon+dx)].join(',');
   try{
    const map=await get('/map/bounds/',{latlng:bounds});
    type Candidate={uid:number;lat:number;lon:number};const rows:unknown[]=Array.isArray(map.data)?map.data:[];
    const candidates=rows.filter((row):row is Candidate=>{if(!row||typeof row!=='object')return false;const r=row as Record<string,unknown>;return typeof r.uid==='number'&&Number.isInteger(r.uid)&&r.uid>0&&typeof r.lat==='number'&&typeof r.lon==='number'&&validCoordinates(r.lat,r.lon)&&distanceKm(lat,lon,r.lat,r.lon)<=500;}).sort((a,b)=>distanceKm(lat,lon,a.lat,a.lon)-distanceKm(lat,lon,b.lat,b.lon)).filter((row,i,list)=>list.findIndex(other=>other.uid===row.uid)===i).slice(0,3);
    const results=await Promise.allSettled(candidates.map(async row=>parseReportedAQI(await get(`/feed/@${row.uid}/`),lat,lon)));
    const fresh=results.flatMap(r=>r.status==='fulfilled'&&r.value&&reportedFresh(r.value,Date.now())?[r.value]:[]).sort((a,b)=>a.distanceKm-b.distanceKm);
    if(fresh.length)reading=fresh[0];
   }catch(error){if(!reading)throw error;/* Preserve an attributed last-known report, visibly stale. */}
  }
  return NextResponse.json(reading?{status:'ok',reading}:{status:'unavailable',reason:'No usable station AQI with source attribution and observation time was returned within 500 km.'},{headers});
 }catch(error){return NextResponse.json({error:'The live station AQI provider could not be reached.'},{status:error instanceof ProviderError&&error.status===429?429:503,headers:{...headers,'Retry-After':String(error instanceof ProviderError?error.retryAfter??60:60)}})}
}
