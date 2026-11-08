import { NextRequest,NextResponse } from 'next/server';
import { uuid } from '@/lib/radio';
import { radioRequest } from '@/lib/server/radio';
export async function POST(request:NextRequest){if(request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({error:'Invalid origin'},{status:403});try{const {id}=await request.json();if(typeof id!=='string'||!uuid(id))return NextResponse.json({error:'Invalid station'},{status:400});await radioRequest(`/json/url/${id}`);return NextResponse.json({ok:true})}catch{return NextResponse.json({error:'Click registration unavailable'},{status:503})}}
