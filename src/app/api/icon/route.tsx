import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
export async function GET(request:NextRequest){const size=request.nextUrl.searchParams.get('size')==='192'?192:512;return new ImageResponse(<div style={{width:'100%',height:'100%',background:'#0c1822',display:'flex',alignItems:'center',justifyContent:'center',color:'#d3e7bd',fontSize:size*.57,fontWeight:600,borderRadius:size*.2}}>B</div>,{width:size,height:size,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})}
