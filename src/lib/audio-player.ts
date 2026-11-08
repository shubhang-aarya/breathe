'use client';
/** Two native elements: no stream CORS permissions or AnalyserNode required. */
export class RadioAudio{
 private decks=[new Audio(),new Audio()];private current=0;private frame=0;private serial=0;private volume=.35;private muted=false;onError:(()=>void)|null=null;
 constructor(){for(const deck of this.decks){deck.preload='none';deck.addEventListener('error',()=>{if(deck===this.decks[this.current])this.onError?.()})}}
 async switch(url:string){const serial=++this.serial;cancelAnimationFrame(this.frame);const old=this.decks[this.current];this.current=1-this.current;const next=this.decks[this.current];next.pause();next.src=url;next.volume=0;
 let timeout:ReturnType<typeof setTimeout>|undefined;try{await Promise.race([next.play(),new Promise<never>((_,reject)=>{timeout=setTimeout(()=>reject(new Error("Stream connection timed out")),12000)})])}catch(error){if(serial===this.serial){old.pause();next.pause();throw error}return false}finally{if(timeout)clearTimeout(timeout)}
 if(serial!==this.serial){next.pause();return false}const start=performance.now();const oldVolume=old.volume;const tick=(now:number)=>{if(serial!==this.serial)return;const f=Math.min(1,(now-start)/600);next.volume=(this.muted?0:this.volume)*f;old.volume=oldVolume*(1-f);if(f<1)this.frame=requestAnimationFrame(tick);else{old.pause();old.removeAttribute('src');old.load()}};this.frame=requestAnimationFrame(tick);return true;
 }
 setVolume(volume:number,muted:boolean){this.volume=Math.max(0,Math.min(1,volume));this.muted=muted;cancelAnimationFrame(this.frame);const current=this.decks[this.current];const other=this.decks[1-this.current];other.pause();const initial=current.volume;const target=muted?0:this.volume;const start=performance.now();const tick=(now:number)=>{const f=Math.min(1,(now-start)/220);current.volume=initial+(target-initial)*f;if(f<1)this.frame=requestAnimationFrame(tick)};this.frame=requestAnimationFrame(tick)}
 pause(){++this.serial;cancelAnimationFrame(this.frame);this.decks.forEach(a=>a.pause())}
 destroy(){this.pause();this.decks.forEach(a=>{a.removeAttribute('src');a.load()});this.onError=null}
}
