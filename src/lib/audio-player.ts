'use client';
/** Two native elements: no stream CORS permissions or AnalyserNode required. */
export class RadioAudio{
 private decks=[new Audio(),new Audio()];private current=0;private frame=0;private serial=0;private volume=.35;private muted=false;private intendedPlay=false;onError:(()=>void)|null=null;
 constructor(){for(const deck of this.decks){deck.preload='none';deck.addEventListener('error',()=>{if(deck===this.decks[this.current])this.onError?.()})}}
 async switch(url:string){this.intendedPlay=true;const serial=++this.serial;cancelAnimationFrame(this.frame);const old=this.decks[this.current];this.current=1-this.current;const next=this.decks[this.current];next.pause();next.src=url;next.volume=0;
 let timeout:ReturnType<typeof setTimeout>|undefined;try{await Promise.race([next.play(),new Promise<never>((_,reject)=>{timeout=setTimeout(()=>reject(new Error("Stream connection timed out")),12000)})])}catch(error){if(serial===this.serial){old.pause();next.pause();throw error}return false}finally{if(timeout)clearTimeout(timeout)}
 if(serial!==this.serial){if(!this.intendedPlay||next!==this.decks[this.current])next.pause();return false}const start=performance.now();const oldVolume=old.volume;const tick=(now:number)=>{if(serial!==this.serial)return;const f=Math.min(1,(now-start)/600);next.volume=(this.muted?0:this.volume)*f;old.volume=oldVolume*(1-f);if(f<1)this.frame=requestAnimationFrame(tick);else{old.pause();old.removeAttribute('src');old.load()}};this.frame=requestAnimationFrame(tick);return true;
 }
 /** Warm both media elements synchronously from the entry gesture. Policy may still require Play. */
 unlock(){
  const bytes=new Uint8Array(46),view=new DataView(bytes.buffer);const word=(offset:number,text:string)=>{for(let i=0;i<text.length;i++)bytes[offset+i]=text.charCodeAt(i)};
  word(0,'RIFF');view.setUint32(4,38,true);word(8,'WAVE');word(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,8000,true);view.setUint32(28,16000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);word(36,'data');view.setUint32(40,2,true);
  const url='data:audio/wav;base64,'+btoa(String.fromCharCode(...bytes)),serial=this.serial;
  for(const deck of this.decks){deck.src=url;deck.volume=0;void deck.play().then(()=>{if(serial===this.serial){deck.pause();deck.removeAttribute('src');deck.load()}}).catch(()=>{})}
 }
 setVolume(volume:number,muted:boolean){this.volume=Math.max(0,Math.min(1,volume));this.muted=muted;cancelAnimationFrame(this.frame);const current=this.decks[this.current];const other=this.decks[1-this.current];other.pause();const initial=current.volume;const target=muted?0:this.volume;const start=performance.now();const tick=(now:number)=>{const f=Math.min(1,(now-start)/220);current.volume=initial+(target-initial)*f;if(f<1)this.frame=requestAnimationFrame(tick)};this.frame=requestAnimationFrame(tick)}
 pause(){this.intendedPlay=false;++this.serial;cancelAnimationFrame(this.frame);this.decks.forEach(a=>a.pause())}
 destroy(){this.pause();this.decks.forEach(a=>{a.removeAttribute('src');a.load()});this.onError=null}
}

let shared:RadioAudio|null=null;
export function getRadioAudio(){return shared??=(new RadioAudio())}
export function unlockRadioAudio(){try{getRadioAudio().unlock()}catch{/* Entry must still work if media is unavailable. */}}
export function releaseRadioAudio(player:RadioAudio){player.destroy();if(shared===player)shared=null}
