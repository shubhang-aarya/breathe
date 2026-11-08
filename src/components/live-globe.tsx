'use client';
import { useEffect, useRef, useState } from 'react';
import type { GlobeInstance } from 'globe.gl';
import { airColor } from '@/lib/air-color';
import type { Air, Place } from '@/lib/air';
export default function LiveGlobe({data,pins,active,onPin,lowPower,onFailure}:{data:Air[];pins:Place[];active:Place|null;onPin:(p:Place)=>void;lowPower:boolean;onFailure:()=>void}){
 const failureHandler=useRef(onFailure);useEffect(()=>{failureHandler.current=onFailure},[onFailure]);
 const host=useRef<HTMLDivElement>(null);const globe=useRef<GlobeInstance|null>(null);const pinHandler=useRef(onPin);const latest=useRef({data,pins,active});const [failed,setFailed]=useState(false);
 useEffect(()=>{pinHandler.current=onPin;latest.current={data,pins,active};if(globe.current){globe.current.pointsData(data.filter(d=>d.aqi!==null)).ringsData(pins);if(active)globe.current.pointOfView({lat:active.lat,lng:active.lon,altitude:1.7},matchMedia('(prefers-reduced-motion: reduce)').matches?0:1400)}},[data,pins,active,onPin]);
 useEffect(()=>{
  if(!host.current)return;let disposed=false;let observer:ResizeObserver|undefined;let timer:ReturnType<typeof setTimeout>|undefined;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  void import('globe.gl').then(({default:Globe})=>{
   if(disposed||!host.current)return;
   const g=new Globe(host.current,{rendererConfig:{antialias:!lowPower,alpha:true},animateIn:!reduced}).backgroundColor('#00000000').showAtmosphere(true).atmosphereColor('#9dbbab').atmosphereAltitude(.16).globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg').pointAltitude(.008).pointRadius(.45).pointColor(d=>airColor((d as Air).aqi)).pointLat(d=>(d as Air).place.lat).pointLng(d=>(d as Air).place.lon).pointLabel(()=> '').onGlobeClick(({lat,lng})=>pinHandler.current({lat,lon:lng,name:`${lat.toFixed(2)}°, ${lng.toFixed(2)}°`})).onPointClick(d=>pinHandler.current((d as Air).place));
   globe.current=g;g.renderer().setPixelRatio(Math.min(devicePixelRatio,lowPower?1:1.5));const controls=g.controls();controls.autoRotate=!reduced&&!lowPower;controls.autoRotateSpeed=.3;controls.enableDamping=true;controls.minDistance=150;controls.maxDistance=550;
   controls.addEventListener('start',()=>{controls.autoRotate=false;if(timer)clearTimeout(timer)});controls.addEventListener('end',()=>{timer=setTimeout(()=>{if(!disposed)controls.autoRotate=!reduced&&!lowPower},6000)});
   g.renderer().domElement.addEventListener('webglcontextlost',()=>{setFailed(true);failureHandler.current()},{once:true});
   observer=new ResizeObserver(()=>{if(host.current)g.width(host.current.clientWidth).height(host.current.clientHeight)});observer.observe(host.current);
   g.pointsData(latest.current.data.filter(d=>d.aqi!==null)).ringsData(latest.current.pins).ringLat(d=>(d as Place).lat).ringLng(d=>(d as Place).lon).ringColor(()=>'#d2e4c6').ringMaxRadius(3).ringPropagationSpeed(reduced||lowPower?0:1).ringRepeatPeriod(1500);
   const p=latest.current.active;g.pointOfView({lat:p?.lat??20,lng:p?.lon??77,altitude:p?1.7:2.2});
  }).catch(()=>{if(!disposed){setFailed(true);failureHandler.current()}});
  return()=>{disposed=true;observer?.disconnect();if(timer)clearTimeout(timer);globe.current?._destructor();globe.current=null};
 },[lowPower]);
 return <div className="live-globe" ref={host} aria-label="Interactive globe. Drag to rotate, scroll to zoom. Use the city search for keyboard access.">{failed&&<div className="globe-fallback" role="status">3D view is unavailable on this device. Explore using the city search and location list.</div>}</div>;
}
