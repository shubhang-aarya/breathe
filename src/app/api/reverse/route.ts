import { NextRequest, NextResponse } from 'next/server';
import { validCoordinates } from '@/lib/air';
import { reversePlace } from '@/lib/server/reverse-geocoding';
export async function GET(request: NextRequest) {
  const a = request.nextUrl.searchParams.get('lat'), b = request.nextUrl.searchParams.get('lon');
  if (!a?.trim() || !b?.trim() || !validCoordinates(Number(a), Number(b))) return NextResponse.json({ error: 'Valid coordinates are required.' }, { status: 400 });
  if (!process.env.BIGDATACLOUD_API_KEY) return NextResponse.json({ place: null, note: 'City names for globe pins require a server reverse-geocoding key. Coordinates and city search still work.' });
  try { return NextResponse.json(await reversePlace(Number(Number(a).toFixed(3)), Number(Number(b).toFixed(3))), { headers: { 'Cache-Control': 'public, s-maxage=1800' } }); }
  catch { return NextResponse.json({ error: 'Place naming is temporarily unavailable. Coordinates remain usable.' }, { status: 503 }); }
}
