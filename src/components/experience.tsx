"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight, AudioLines, ChevronRight, Globe2, Info, Leaf, Radio, Wind, X, Zap } from "lucide-react";
import { LiquidButtons } from "./liquid-buttons";
import { Glass, DataBadge } from "./glass";
import { Explorer } from "./explorer";
import { SoundSettings } from './sound-settings';
import { unlockSounds } from '@/lib/ui-sound';
import { PwaStatus } from './pwa-status';
import { Planet } from "./planet";
import { useExperience } from "@/store/experience";

const credits = [
  ["LiquidGlass buttons", "ybouane/liquidglass · MIT · v1.0.3", "https://github.com/ybouane/liquidglass"],
  ["City search", "Open-Meteo geocoding · GeoNames location data", "https://open-meteo.com/en/docs/geocoding-api"],
  ["Open-Meteo", "CAMS modeled air quality, forecasts and weather", "https://open-meteo.com/en/docs/air-quality-api"],
  ["OpenAQ", "Station measurements · API key required", "https://docs.openaq.org/"],
  ["Earth imagery", "Blue Marble / Earth textures via three-globe example assets", "https://github.com/vasturiano/three-globe"],
  ["Radio Browser", "Community-maintained radio station directory", "https://api.radio-browser.info/"],
];
export function Experience(){
 const {entered,enter,lowPower,toggleLowPower}=useExperience();
 const [creditsOpen,setCreditsOpen]=useState(false);

 const close=useRef<HTMLButtonElement>(null);
 const creditsButton=useRef<HTMLButtonElement>(null);
 const audio=useRef<AudioContext|null>(null);

 useEffect(()=>{if(!creditsOpen)return; const previous=document.activeElement as HTMLElement;close.current?.focus();const handler=(e:KeyboardEvent)=>{if(e.key==="Escape")setCreditsOpen(false);if(e.key==="Tab"){const nodes=document.querySelectorAll<HTMLElement>("[data-dialog] button, [data-dialog] a");const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};document.addEventListener("keydown",handler);return()=>{document.removeEventListener("keydown",handler);previous?.focus()}},[creditsOpen]);
 function begin(){unlockSounds();try{audio.current ??= new AudioContext();void audio.current.resume().catch(()=>{});}catch{/* Browsers without audio can still explore. */}enter();}
 return <div className={`experience ${lowPower?"low-power":""}`}>
  <a href="#main" className="skip-link">Skip to content</a>
  <header className="topbar"><Link className="brand" href="/" aria-label="Breathe home"><Wind size={29} strokeWidth={1.5}/><span>BREATHE</span></Link><span className="edition">AIR QUALITY. HUMAN PERSPECTIVE.</span><LiquidButtons className="header-actions"><SoundSettings/><button className="quiet-button power-button" onClick={toggleLowPower} aria-pressed={lowPower}><Zap size={15}/><span>{lowPower?"Low power on":"Low power"}</span></button><button ref={creditsButton} className="icon-button" aria-label="Data and credits" onClick={()=>setCreditsOpen(true)}><Info size={19}/></button></LiquidButtons></header>
  <PwaStatus/><main id="main"><AnimatePresence mode="wait">{!entered?<motion.div key="welcome" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,scale:1.015,filter:"blur(5px)"}} transition={{duration:.5,ease:[.22,1,.36,1]}} className="welcome">
   <div className="hero-copy"><div className="eyebrow"><span className="tiny-dot"/> A LITTLE PERSPECTIVE CHANGES EVERYTHING</div><h1>The world turns.<br/>Let’s breathe<br/><span>better.</span></h1><p className="intro">Explore the air we share. Find a cleaner corner of the world. Tune into life somewhere new.</p><LiquidButtons className="entry-actions"><button className="enter-button" onClick={begin}>Enter BREATHE <ArrowRight size={20}/></button></LiquidButtons><div className="audio-note"><AudioLines size={15}/> A world of air. A little local radio. Sound is optional.</div></div>
   <Planet/>
   <div className="welcome-bottom"><span>BUILT FOR A CLEARER TOMORROW</span><div className="scroll-note"><ArrowDown size={14}/> YOUR JOURNEY STARTS WITH A BREATH</div><span>DIWALI CHALLENGE ’26</span></div>
   <div className="feature-strip"><div><Globe2/><span><strong>A world to explore</strong><small>One shared atmosphere</small></span></div><div><Wind/><span><strong>Clarity in every reading</strong><small>Sources, timestamps, and honest data</small></span></div><div><Radio/><span><strong>The sound of somewhere</strong><small>Local radio, a world away</small></span></div></div>
  </motion.div>:<motion.div key="explore" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.5,ease:[.22,1,.36,1]}}><Explorer/></motion.div>}</AnimatePresence></main>
  <footer><span>Made for the air we share.</span><button onClick={()=>setCreditsOpen(true)}>Data & credits <ChevronRight size={13}/></button><span className="footer-phase">AIR QUALITY · HUMAN PERSPECTIVE</span></footer>
  <AnimatePresence>{creditsOpen&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={e=>{if(e.target===e.currentTarget)setCreditsOpen(false)}}><Glass data-dialog role="dialog" aria-modal="true" aria-labelledby="credits-title" className="credits-panel" initial={{y:20}} animate={{y:0}}><div className="panel-title"><Leaf size={22}/><button ref={close} onClick={()=>setCreditsOpen(false)} className="icon-button" aria-label="Close data and credits"><X size={20}/></button></div><div className="eyebrow">TRANSPARENCY, BY DESIGN</div><h2 id="credits-title">Know your air.</h2><p>BREATHE is in active development. Open-Meteo supplies CAMS modeled air quality. These are model estimates, not station measurements. Radio Browser supplies the radio directory. OpenAQ supplies separate station concentrations when configured and available. Every reading includes its type, source, and update time.</p><div className="credits-list">{credits.map(([name,description,url])=><a key={name} href={url} target="_blank" rel="noreferrer"><div><strong>{name}</strong><small>{description}</small></div><ArrowRight size={16}/></a>)}</div><h3>A reading is only useful with context.</h3><div className="badge-list">{(["MEASURED","MODELED","FORECAST","HISTORICAL","STALE"] as const).map(kind=><DataBadge key={kind} kind={kind}/>)}</div><p className="fine-print">US AQI will be the primary scale. Forecasts will always be distinct from actual readings. General health information is not medical advice.</p></Glass></motion.div>}</AnimatePresence>
 </div>
}
