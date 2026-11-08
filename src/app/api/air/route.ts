import { NextRequest, NextResponse } from 'next/server';
import { cities, validCoordinates, type Place } from '@/lib/air';
import { grid,gridBatchSize,gridBatchCount } from '@/lib/sampling';
import { fetchAir } from '@/lib/server/open-meteo';
export async function GET(request:NextRequest){
 const params=request.nextUrl.searchParams;let places:Place[];
 if(params.get('scope')==='cities'){const batch=Number(params.get('batch')??0);if(!Number.isInteger(batch)||batch<0||batch>=Math.ceil(cities.length/14))return NextResponse.json({error:'Invalid city batch.'},{status:400});places=cities.slice(batch*14,(batch+1)*14);}
 else if(params.get('scope')==='grid'){const batch=Number(params.get('batch'));if(!params.has('batch')||!Number.isInteger(batch)||batch<0||batch>=gridBatchCount)return NextResponse.json({error:'Invalid grid batch.'},{status:400});places=grid.slice(batch*gridBatchSize,(batch+1)*gridBatchSize);}
 else {const a=params.get('lat'),b=params.get('lon');const lat=Number(a),lon=Number(b);if(a===null||b===null||a.trim()===''||b.trim()===''||!validCoordinates(lat,lon))return NextResponse.json({error:'Choose valid latitude and longitude.'},{status:400});places=[{lat,lon,name:`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`}];}
 try{return NextResponse.json(await fetchAir(places,params.get('history')==='true'&&places.length===1),{headers:{'Cache-Control':'public, s-maxage=900, stale-while-revalidate=900'}})}catch{return NextResponse.json({error:'Air quality is unavailable right now. Please try again shortly.'},{status:503,headers:{'Retry-After':'30'}})}
}
