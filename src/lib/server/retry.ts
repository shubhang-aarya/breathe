import 'server-only';
import { takeBudget,recordProviderCooldown } from './quota';
export class ProviderError extends Error{constructor(public status:number,public retryAfter:number|null=null){super('Data provider is temporarily unavailable')}}
export function retryDelay(headers:Headers,now=Date.now()):number|null{
 const raw=headers.get('retry-after');const reset=headers.get('x-ratelimit-reset');
 if(raw){const seconds=Number(raw);if(Number.isFinite(seconds))return Math.max(0,seconds)*1000;const time=Date.parse(raw);if(Number.isFinite(time))return Math.max(0,time-now)}
 if(reset!==null&&Number.isFinite(Number(reset)))return Math.max(0,Number(reset))*1000;return null;
}
/** Respect provider cooldowns; never retry a 429 earlier than advertised. */
export async function providerFetch(url:string,init:RequestInit={},fetcher:typeof fetch=fetch):Promise<Response>{
 const host=new URL(url).hostname;
 const budget=host==='api.openaq.org'?'openaq':host==='api.airvisual.com'?'iqair':null;
 for(let attempt=0;attempt<3;attempt++){
  if(budget){let quota;try{quota=await takeBudget(budget)}catch{throw new ProviderError(503,60)}if(!quota.allowed)throw new ProviderError(429,quota.retryAfter);}
  let r:Response;try{r=await fetcher(url,{...init,signal:AbortSignal.timeout(10000)})}catch{if(attempt===2)throw new ProviderError(503);await new Promise(resolve=>setTimeout(resolve,500*2**attempt));continue}
  if(r.ok)return r;
  if(r.status!==429&&r.status<500)throw new ProviderError(r.status);
  const cooldown=retryDelay(r.headers);
  if(budget&&r.status===429){const seconds=Math.max(1,Math.ceil((cooldown??60000)/1000));try{await recordProviderCooldown(budget,seconds)}catch{/* Local cooldown remains; shared failure blocks subsequent reservations. */}throw new ProviderError(429,seconds);}
if(attempt===2||cooldown!==null&&cooldown>4000)throw new ProviderError(r.status,cooldown===null?null:Math.ceil(cooldown/1000));
  await new Promise(resolve=>setTimeout(resolve,Math.max(cooldown??0,500*2**attempt)+Math.random()*100));
 }
 throw new ProviderError(503);
}
