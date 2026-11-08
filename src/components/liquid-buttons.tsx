'use client';
import { useEffect,useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { useExperience } from '@/store/experience';
import { loadLiquidGlass,type LiquidInstance } from '@/lib/liquid-glass-loader';
// Frosted Panel recipe from liquid-glass.ybouane.com; documented defaults elsewhere.
const defaults={button:true,floating:false,blurAmount:.25,cornerRadius:30,zRadius:40,refraction:.69,chromAberration:.05,edgeHighlight:.05,specular:0,fresnel:1,brightness:0,saturation:0,shadowOpacity:.3,shadowSpread:10,bevelMode:0};
/** The renderer owns decorative surfaces only. It never captures or mutates a button. */
export function LiquidButtons({children,className='',...props}:HTMLAttributes<HTMLDivElement>){
 const root=useRef<HTMLDivElement>(null),effectRoot=useRef<HTMLDivElement>(null);const lowPower=useExperience(s=>s.lowPower);
 useEffect(()=>{
  const target=root.current,scene=effectRoot.current;if(!target||!scene||lowPower||typeof window.matchMedia!=='function'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let disposed=false,revision=0;let instance:LiquidInstance|null=null;let current:HTMLButtonElement[]=[];let surfaces:HTMLDivElement[]=[];
  const layout=()=>{current.forEach((button,i)=>{const surface=surfaces[i];if(!surface)return;Object.assign(surface.style,{left:`${button.offsetLeft}px`,top:`${button.offsetTop}px`,width:`${button.offsetWidth}px`,height:`${button.offsetHeight}px`,borderRadius:'30px'});surface.dataset.config=JSON.stringify(defaults);});const light=scene.querySelector<HTMLElement>('.liquid-capture-light');if(light){const shapes=current.map(button=>{const x=button.offsetLeft,y=button.offsetTop,w=button.offsetWidth,h=button.offsetHeight,r=Math.min(30,w/2,h/2);return `M ${x+r} ${y} H ${x+w-r} Q ${x+w} ${y} ${x+w} ${y+r} V ${y+h-r} Q ${x+w} ${y+h} ${x+w-r} ${y+h} H ${x+r} Q ${x} ${y+h} ${x} ${y+h-r} V ${y+r} Q ${x} ${y} ${x+r} ${y} Z`}).join(' ');light.style.clipPath=`path('${shapes}')`}instance?.markChanged()};
  const refresh=async()=>{
   const buttons=Array.from(target.children).filter((node):node is HTMLButtonElement=>node instanceof HTMLButtonElement);if(buttons.length===current.length&&buttons.every((b,i)=>b===current[i]))return;
   const token=++revision;instance?.destroy();instance=null;target.removeAttribute('data-liquid-ready');surfaces.forEach(s=>s.remove());current.forEach(b=>resize?.unobserve(b));current=buttons;
   surfaces=buttons.map(()=>{const surface=document.createElement('div');surface.className='liquid-button-surface';surface.setAttribute('aria-hidden','true');scene.appendChild(surface);return surface});buttons.forEach(b=>resize?.observe(b));layout();if(!surfaces.length)return;
   try{const library=await loadLiquidGlass();if(disposed||token!==revision)return;const active=await library.LiquidGlass.init({root:scene,glassElements:surfaces,defaults});if(disposed||token!==revision){active.destroy();return}instance=active;target.setAttribute('data-liquid-ready','true')}catch{/* Readable semantic controls remain independent of the decorative renderer. */}
  };
  const resize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(layout);resize?.observe(target);
  void refresh();const observer=new MutationObserver(()=>void refresh());observer.observe(target,{childList:true});
  return()=>{disposed=true;revision++;observer.disconnect();resize?.disconnect();instance?.destroy();surfaces.forEach(s=>s.remove());target.removeAttribute('data-liquid-ready')};
 },[lowPower]);
 return <div ref={root} className={`liquid-buttons ${className}`} data-glass-preset="frosted-panel" {...props}><div ref={effectRoot} className="liquid-effect-scene" aria-hidden="true"><div className="liquid-capture-light"/></div>{children}</div>;
}
