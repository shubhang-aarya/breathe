import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { parseDeepLink } from '@/lib/deep-link';
import { category } from '@/lib/air';
import { airColor } from '@/lib/air-color';
import { frameAt,frameKind } from '@/lib/timeline';
import { fetchAir } from '@/lib/server/open-meteo';
export const runtime='nodejs';
export async function GET(request:NextRequest){
 const link=parseDeepLink(request.nextUrl.searchParams);let aqi:number|null=null;let observed:string|null=null;let fetched:string|null=null;let stale=false;
 if(link.place){try{const rows=await fetchAir([link.place]);const reading=rows[0]?frameAt(rows[0],link.offset):null;aqi=reading?.aqi??null;observed=reading?.observedAt??null;fetched=reading?.fetchedAt??null;stale=!!(rows[0]?.observedAt&&Date.now()-Date.parse(rows[0].observedAt)>2*3600000)}catch{/* Honest empty preview when provider is unavailable. */}}
 return new ImageResponse(<div style={{width:'100%',height:'100%',background:'#0b141c',color:'#eff5ed',display:'flex',flexDirection:'column',padding:65,fontFamily:'sans-serif'}}><div style={{display:'flex',fontSize:26,letterSpacing:8}}>BREATHE</div><div style={{display:'flex',fontSize:38,marginTop:35}}>{link.place?`${link.place.lat.toFixed(2)}°, ${link.place.lon.toFixed(2)}°`:'The air we share.'}</div><div style={{display:'flex',alignItems:'baseline',gap:24,marginTop:12}}><span style={{fontSize:130,color:airColor(aqi)}}>{aqi??'No data'}</span><span style={{fontSize:28}}>US AQI · {category(aqi)}</span></div><div style={{display:'flex',fontSize:20,marginTop:12}}>{frameKind(link.offset)}{stale?' · STALE / Not live':''} · Open-Meteo / CAMS</div><div style={{display:'flex',fontSize:18,color:'#a9b8ba',marginTop:18}}>Valid time: {observed??'unavailable'}</div><div style={{display:'flex',fontSize:18,color:'#a9b8ba',marginTop:8}}>Retrieved {fetched??'unavailable'} · Model estimate</div></div>,{width:1200,height:630,headers:{'Cache-Control':'public, s-maxage=900, stale-while-revalidate=900'}});
}
