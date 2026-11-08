'use client';
import { useEffect,useId,useState,useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin,Search,X } from 'lucide-react';
import { cities,coordinateKey,type Place } from '@/lib/air';
import { normalizeSearch } from '@/lib/geocoding';
import { Glass } from './glass';
type Response={places:Place[];source:string;fetchedAt:string};
export function CitySearch({onSelect}:{onSelect:(place:Place)=>void}){
 const options=useRef<HTMLDivElement>(null);
 const [input,setInput]=useState('');const term=normalizeSearch(input);const [debounced,setDebounced]=useState('');const [cursor,setCursor]=useState(0);const [open,setOpen]=useState(true);const id=useId();
 useEffect(()=>{const timer=setTimeout(()=>setDebounced(term),300);return()=>clearTimeout(timer)},[term]);
 const query=useQuery({queryKey:['city-search',debounced.toLowerCase()],queryFn:async({signal}):Promise<Response>=>{const response=await fetch(`/api/search?q=${encodeURIComponent(debounced)}`,{signal});if(!response.ok)throw new Error('Search unavailable');return response.json()},enabled:debounced.length>=2,staleTime:30*60000,retry:false});
 const searching=term.length>=2&&(term!==debounced||query.isPending);const fallback=cities.filter(p=>p.name.toLowerCase().includes(term.toLowerCase())).slice(0,8);
 const results=term.length<2?cities.slice(0,8):term===debounced&&query.isSuccess?query.data.places:query.isError||searching?fallback:[];
 const selected=Math.min(cursor,Math.max(0,results.length-1));
 useEffect(()=>{const option=options.current?.querySelector<HTMLElement>('[aria-selected="true"]');option?.scrollIntoView?.({block:'nearest'})},[selected,open]);
 function choose(place:Place){onSelect(place);setInput('');setCursor(0);setOpen(false)}
 return <div className="city-search"><div className="search-box glass"><Search size={17} aria-hidden="true"/><input role="combobox" aria-label="Search cities worldwide" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-results`} aria-activedescendant={open&&results.length?`${id}-${selected}`:undefined} autoComplete="off" maxLength={80} value={input} placeholder="Search any city…" onFocus={()=>setOpen(true)} onChange={e=>{setInput(e.target.value);setCursor(0);setOpen(true)}} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);return}if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);setCursor(i=>Math.min(i+1,results.length-1))}if(e.key==='ArrowUp'){e.preventDefault();setCursor(i=>Math.max(0,i-1))}if(e.key==='Enter'&&open&&results[selected]){e.preventDefault();choose(results[selected])}}}/>{input&&<button type="button" aria-label="Clear city search" className="clear-search" onClick={()=>{setInput('');setCursor(0);setOpen(true)}}><X size={14}/></button>}</div>{open&&<Glass className="city-results" aria-label="City search results"><p>{term.length>=2?'Search results':'Start somewhere new'}</p><div role="status" className="search-status">{searching?'Searching cities…':term.length===1?'Type at least 2 characters.':query.isError&&term.length>=2?'Live search is unavailable. Showing saved city matches, if any.':''}</div><div ref={options} role="listbox" id={`${id}-results`} aria-label="Matching cities">{results.map((place,index)=><button role="option" aria-selected={index===selected} id={`${id}-${index}`} key={coordinateKey(place)} onMouseEnter={()=>setCursor(index)} onClick={()=>choose(place)}><MapPin size={13} aria-hidden="true"/>{place.name}</button>)}</div>{!searching&&term.length>=2&&!results.length&&<p>{query.isError?'Try again shortly or choose a location on the globe.':'No city found. Try adding the country, e.g. “Phagwara, India”.'}</p>}{query.isError&&term===debounced&&<button onClick={()=>void query.refetch()}>Retry search</button>}{term===debounced&&query.data&&<small className="search-source">{query.data.source} · Retrieved {new Date(query.data.fetchedAt).toLocaleString()}</small>}</Glass>}</div>
}
