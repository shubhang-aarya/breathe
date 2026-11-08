import { NextRequest,NextResponse } from 'next/server';
import { validCoordinates } from '@/lib/air';
import { parseReportedAQI } from '@/lib/reported-aqi';
import { providerFetch,ProviderError } from '@/lib/server/retry';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store, max-age=0','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store'};
export async function GET(request:NextRequest){
 const p=request.nextUrl.searchParams,a=p.get('lat'),b=p.get('lon'),lat=Number(a),lon=Number(b);
 if(a===null||b===null||!a.trim()||!b.trim()||!validCoordinates(lat,lon))return NextResponse.json({error:'Valid coordinates are required'},{status:400,headers});
 const token=process.env.WAQI_API_TOKEN;if(!token)return NextResponse.json({status:'unconfigured'},{headers});
 try{
  const url=new URL(`https://api.waqi.info/feed/geo:${lat.toFixed(4)};${lon.toFixed(4)}/`);url.searchParams.set('token',token);
  const response=await providerFetch(url.href,{cache:'no-store'}),raw=await response.json();
  const reading=parseReportedAQI(raw,lat,lon);
  return NextResponse.json(reading?{status:'ok',reading}:{status:'unavailable',reason:'No usable station AQI with source attribution and observation time was returned within 500 km.'},{headers});
 }catch(error){return NextResponse.json({error:'The live station AQI provider could not be reached.'},{status:error instanceof ProviderError&&error.status===429?429:503,headers:{...headers,'Retry-After':String(error instanceof ProviderError?error.retryAfter??60:60)}})}
}
