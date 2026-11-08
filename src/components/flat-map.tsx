'use client';
import { useEffect, useRef, useState } from 'react';
import type { Map as MapType } from 'maplibre-gl';
import type { Air, Place } from '@/lib/air';
import { airColor } from '@/lib/air-color';
import 'maplibre-gl/dist/maplibre-gl.css';
function features(data:Air[],pins:Place[]){return {type:'FeatureCollection' as const,features:[...data.filter(d=>d.aqi!==null).map(d=>({type:'Feature' as const,geometry:{type:'Point' as const,coordinates:[d.place.lon,d.place.lat]},properties:{name:d.place.name,color:airColor(d.aqi),pin:false}})),...pins.map(p=>({type:'Feature' as const,geometry:{type:'Point' as const,coordinates:[p.lon,p.lat]},properties:{name:p.name,color:'#f0f3ef',pin:true}}))]}}
export default function FlatMap({data,pins,active,onPin}:{data:Air[];pins:Place[];active:Place|null;onPin:(p:Place)=>void}){
 const host=useRef<HTMLDivElement>(null);const map=useRef<MapType|null>(null);const latest=useRef({data,pins,active,onPin});const [failed,setFailed]=useState(false);
 useEffect(()=>{latest.current={data,pins,active,onPin};const source=map.current?.getSource('air');if(source&&'setData' in source)source.setData(features(data,pins));},[data,pins,active,onPin]);
 useEffect(()=>{if(active)map.current?.flyTo({center:[active.lon,active.lat],zoom:5,essential:false})},[active]);
 useEffect(()=>{
 let disposed=false;void import('maplibre-gl').then(({Map,NavigationControl})=>{
  if(disposed||!host.current)return;
  const m=new Map({container:host.current,style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#132024'}}]},center:[77,20],zoom:1.5,attributionControl:{compact:true}});map.current=m;m.addControl(new NavigationControl(),'bottom-left');
  m.on('load',()=>{if(disposed)return;m.addSource('air',{type:'geojson',data:features(latest.current.data,latest.current.pins)});m.addLayer({id:'air',type:'circle',source:'air',paint:{'circle-radius':['case',['get','pin'],8,5],'circle-color':['get','color'],'circle-stroke-color':'#ffffff','circle-stroke-width':1,'circle-opacity':.85}});m.addSource('land',{type:'geojson',data:'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',attribution:'Natural Earth · Public domain'});m.addLayer({id:'land',type:'fill',source:'land',paint:{'fill-color':'#34423e','fill-outline-color':'#637568'}},'air');const p=latest.current.active;if(p)m.jumpTo({center:[p.lon,p.lat],zoom:5})});
  m.on('click',event=>{const points=m.queryRenderedFeatures(event.point,{layers:m.getLayer('air')?['air']:[]});const selected=points[0];const coordinates=selected?.geometry.type==='Point'?selected.geometry.coordinates:null;latest.current.onPin({lat:coordinates?.[1]??event.lngLat.lat,lon:coordinates?.[0]??event.lngLat.lng,name:selected?.properties?.name??`${event.lngLat.lat.toFixed(2)}°, ${event.lngLat.lng.toFixed(2)}°`})});m.on('error',()=>setFailed(true));
 }).catch(()=>{if(!disposed)setFailed(true)});return()=>{disposed=true;map.current?.remove();map.current=null};
 },[]);
 return <div ref={host} className="live-globe flat-map" aria-label="2D air quality map">{failed&&<div className="map-notice" role="status">Some map resources are unavailable. City search remains available.</div>}</div>
}
