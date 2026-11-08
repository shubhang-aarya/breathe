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
  const describe=(raw:unknown)=>{const r=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};const d=r.data&&typeof r.data==='object'?r.data as Record<string,unknown>:{};const city=d.city&&typeof d.city==='object'?d.city as Record<string,unknown>:{};const time=d.time&&typeof d.time==='object'?d.time as Record<string,unknown>:{};const parsed=parseReportedAQI(raw,lat,lon);return {parsed:!!parsed,fresh:parsed?reportedFresh(parsed,Date.now()):false,observedAt:parsed?.observedAt??null,distanceKm:parsed?.distanceKm??null,status:r.status==='ok'?'ok':'error',aqiType:typeof d.aqi,aqi:typeof d.aqi==='number'&&Number.isFinite(d.aqi)?d.aqi:null,coordinateTypes:Array.isArray(city.geo)?city.geo.map(v=>typeof v):[],hasIso:typeof time.iso==='string',hasLocalTime:typeof time.s==='string',hasTimezone:typeof time.tz==='string',attributionCount:Array.isArray(d.attributions)?d.attributions.length:0};};
  const diagnostics:{geo?:ReturnType<typeof describe>;directory?:{status:string;rows:number};feeds:ReturnType<typeof describe>[]}={feeds:[]};
  const raw=await get(`/feed/geo:${lat.toFixed(4)};${lon.toFixed(4)}/`);diagnostics.geo=describe(raw);
  let reading=parseReportedAQI(raw,lat,lon);
  if(!reading||!reportedFresh(reading,Date.now())||reading.distanceKm>50){
   // Some coordinates return no usable geo feed. Discover bounded regional candidates,
   // then fetch full station feeds; map AQIs alone lack the required provenance/time.
   const dy=500/110,dx=Math.min(180,500/(110*Math.max(.01,Math.cos(lat*Math.PI/180))));
   const bounds=[Math.max(-90,lat-dy),Math.max(-180,lon-dx),Math.min(90,lat+dy),Math.min(180,lon+dx)].join(',');
   try{
    const map=await get('/map/bounds/',{latlng:bounds});diagnostics.directory={status:map.status==='ok'?'ok':'error',rows:Array.isArray(map.data)?map.data.length:0};
    type Candidate={uid:number;lat:number;lon:number};const rows:unknown[]=Array.isArray(map.data)?map.data:[];
    const candidates=rows.filter((row):row is Candidate=>{if(!row||typeof row!=='object')return false;const r=row as Record<string,unknown>;return typeof r.uid==='number'&&Number.isInteger(r.uid)&&r.uid>0&&typeof r.lat==='number'&&typeof r.lon==='number'&&validCoordinates(r.lat,r.lon)&&distanceKm(lat,lon,r.lat,r.lon)<=500;}).sort((a,b)=>distanceKm(lat,lon,a.lat,a.lon)-distanceKm(lat,lon,b.lat,b.lon)).filter((row,i,list)=>list.findIndex(other=>other.uid===row.uid)===i).slice(0,3);
    const results=await Promise.allSettled(candidates.map(async row=>{const feed=await get(`/feed/@${row.uid}/`);diagnostics.feeds.push(describe(feed));return parseReportedAQI(feed,lat,lon);}));
    const fresh=results.flatMap(r=>r.status==='fulfilled'&&r.value&&reportedFresh(r.value,Date.now())?[r.value]:[]).sort((a,b)=>a.distanceKm-b.distanceKm);
    if(fresh.length&&(!reading||!reportedFresh(reading,Date.now())||fresh[0].distanceKm<reading.distanceKm))reading=fresh[0];
   }catch(error){if(!reading)throw error;/* Preserve an attributed last-known report, visibly stale. */}
  }
  const result=reading?{status:'ok',reading}:{status:'unavailable',reason:'No usable attributed station AQI was returned by the coordinate or regional lookups.'};
  return NextResponse.json(p.get('diagnostics')==='1'?{...result,diagnostics}:result,{headers});
 }catch(error){return NextResponse.json({error:'The live station AQI provider could not be reached.'},{status:error instanceof ProviderError&&error.status===429?429:503,headers:{...headers,'Retry-After':String(error instanceof ProviderError?error.retryAfter??60:60)}})}
}
