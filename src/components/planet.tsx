'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useExperience } from '@/store/experience';
import type { Air,Place } from '@/lib/air';
const Earth=dynamic(()=>import('./live-globe'),{ssr:false,loading:()=> <div className="earth-fallback"/>});
const data:Air[]=[];const pins:Place[]=[];const ignore=()=>{};
export function Planet(){const lowPower=useExperience(s=>s.lowPower);const [failed,setFailed]=useState(false);return <div className="planet-scene" aria-hidden="true"><div className="earth-halo"/>{failed?<div className="earth-fallback"/>:<Earth data={data} pins={pins} active={null} onPin={ignore} lowPower={lowPower} onFailure={()=>setFailed(true)} decorative/>}<div className="planet-caption"><span className="tiny-dot"/> ONE PLANET. EVERY BREATH.</div></div>}
