import { NextRequest,NextResponse } from 'next/server';
import { validCoordinates } from '@/lib/air';
import { discoverRadio } from '@/lib/server/radio';
export const runtime='nodejs';
export async function GET(request:NextRequest){const p=request.nextUrl.searchParams;const a=p.get('lat'),b=p.get('lon');const lat=Number(a),lon=Number(b);if(a===null||b===null||!a.trim()||!b.trim()||!validCoordinates(lat,lon))return NextResponse.json({error:'Valid coordinates are required'},{status:400});try{return NextResponse.json(await discoverRadio(Number(lat.toFixed(2)),Number(lon.toFixed(2)),/^[A-Z]{2}$/.test(p.get('country')??'')?p.get('country')!:undefined,p.get('region')?.slice(0,120)||undefined),{headers:{'Cache-Control':'public, s-maxage=1200, stale-while-revalidate=600'}})}catch{return NextResponse.json({error:'Radio discovery is temporarily unavailable'},{status:503})}}
