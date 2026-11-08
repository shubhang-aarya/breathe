import { NextRequest, NextResponse } from 'next/server';
import { cities, validCoordinates, type Place } from '@/lib/air';
import { fetchAir } from '@/lib/server/open-meteo';
export async function GET(request:NextRequest){
 const params=request.nextUrl.searchParams;let places:Place[];
 if(params.get('scope')==='cities')places=cities;
 else {const a=params.get('lat'),b=params.get('lon');const lat=Number(a),lon=Number(b);if(a===null||b===null||a.trim()===''||b.trim()===''||!validCoordinates(lat,lon))return NextResponse.json({error:'Choose valid latitude and longitude.'},{status:400});places=[{lat,lon,name:`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`}];}
 try{return NextResponse.json(await fetchAir(places),{headers:{'Cache-Control':'public, s-maxage=900, stale-while-revalidate=900'}})}catch{return NextResponse.json({error:'Air quality is unavailable right now. Please try again shortly.'},{status:503,headers:{'Retry-After':'30'}})}
}
