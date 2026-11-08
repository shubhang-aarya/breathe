'use client';
import { useEffect,useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { useExperience } from '@/store/experience';
import { loadLiquidGlass,type LiquidInstance } from '@/lib/liquid-glass-loader';
const defaults={button:true,floating:false,cornerRadius:28,zRadius:14,refraction:.45,blurAmount:.12,chromAberration:.012,edgeHighlight:.12,specular:.12,fresnel:.55,tintStrength:0,shadowOpacity:.12,shadowSpread:5};
/** One renderer per button group; the original native buttons remain interactive. */
export function LiquidButtons({children,className='',...props}:HTMLAttributes<HTMLDivElement>){
 const root=useRef<HTMLDivElement>(null);const lowPower=useExperience(s=>s.lowPower);
 useEffect(()=>{
  const target=root.current;if(!target||lowPower||typeof window.matchMedia!=='function'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let disposed=false;let instance:LiquidInstance|null=null;let current:HTMLElement[]=[];let revision=0;
  const refresh=async()=>{const buttons=Array.from(target.children).filter((node):node is HTMLButtonElement=>node instanceof HTMLButtonElement);if(buttons.length===current.length&&buttons.every((b,i)=>b===current[i]))return;current=buttons;const token=++revision;instance?.destroy();instance=null;target.removeAttribute('data-liquid-ready');if(!buttons.length)return;
   try{const library=await loadLiquidGlass();if(disposed||token!==revision)return;const active=await library.LiquidGlass.init({root:target,glassElements:buttons,defaults});if(disposed||token!==revision){active.destroy();return}instance=active;target.setAttribute('data-liquid-ready','true')}catch{/* Preserve native buttons and frosted CSS when WebGL/CDN capture fails. */}
  };
  void refresh();const observer=new MutationObserver(()=>void refresh());observer.observe(target,{childList:true});
  return()=>{disposed=true;revision++;observer.disconnect();instance?.destroy();target.removeAttribute('data-liquid-ready')};
 },[lowPower]);
 return <div ref={root} className={`liquid-buttons ${className}`} {...props}><div className="liquid-capture-light" aria-hidden="true"/>{children}</div>;
}
