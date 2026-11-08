import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Experience } from '@/components/experience';
import { parseDeepLink } from '@/lib/deep-link';
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}):Promise<Metadata>{
 const params=await searchParams;const query=new URLSearchParams();for(const key of ['lat','lon','t']){if(typeof params[key]==='string')query.set(key,params[key])}
 const link=parseDeepLink(query);if(!link.place)return {};
 const h=await headers();const host=h.get('host');if(!host)return {};const protocol=host.startsWith('localhost')?'http':'https';const image=new URL('/api/og',`${protocol}://${host}`);image.search=query.toString();
 return {openGraph:{title:'BREATHE · The air we share',images:[{url:image.toString(),width:1200,height:630,alt:'Air quality context for the shared coordinates'}]},twitter:{card:'summary_large_image',images:[image.toString()]}};
}
export default function Page(){return <Experience/>}
