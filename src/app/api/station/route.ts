import { NextRequest,NextResponse } from 'next/server';
import { validCoordinates } from '@/lib/air';
import { fetchStation } from '@/lib/server/openaq';
import { ProviderError } from '@/lib/server/retry';
export async function GET(request:NextRequest){
 const p=request.nextUrl.searchParams;const a=p.get('lat'),b=p.get('lon');const lat=Number(a),lon=Number(b);if(a===null||b===null||!a.trim()||!b.trim()||!validCoordinates(lat,lon))return NextResponse.json({error:'Valid coordinates are required'},{status:400});
 if(!process.env.OPENAQ_API_KEY)return NextResponse.json({status:'unconfigured'},{headers:{'Cache-Control':'no-store'}});
 try{return NextResponse.json({status:'ok',station:await fetchStation(Number(lat.toFixed(3)),Number(lon.toFixed(3)))},{headers:{'Cache-Control':'public, s-maxage=600, stale-while-revalidate=300'}})}catch(error){const delay=error instanceof ProviderError?error.retryAfter:null;return NextResponse.json({error:'Station measurements are temporarily unavailable. Modeled data remains available.'},{status:error instanceof ProviderError&&error.status===429?429:503,headers:{'Retry-After':String(delay??60)}})}
}
