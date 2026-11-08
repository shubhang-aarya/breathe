import { afterEach,expect,it,vi } from 'vitest';
import { RadioAudio } from './audio-player';
const decks:{volume:number;src:string;play:ReturnType<typeof vi.fn>;pause:ReturnType<typeof vi.fn>;load:ReturnType<typeof vi.fn>;removeAttribute:ReturnType<typeof vi.fn>;addEventListener:ReturnType<typeof vi.fn>}[]=[];
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();decks.length=0});
it('crossfades native elements, preserves mute and releases streams',async()=>{
 let tick:FrameRequestCallback|undefined;
 vi.stubGlobal('requestAnimationFrame',vi.fn((fn:FrameRequestCallback)=>{tick=fn;return 1}));vi.stubGlobal('cancelAnimationFrame',vi.fn());vi.spyOn(performance,'now').mockReturnValue(0);
 vi.stubGlobal('Audio',class {volume=1;src='';play=vi.fn().mockResolvedValue(undefined);pause=vi.fn();load=vi.fn();removeAttribute=vi.fn();addEventListener=vi.fn();constructor(){decks.push(this)}});
 const player=new RadioAudio();expect(await player.switch('https://example.com/one')).toBe(true);tick?.(600);expect(decks[1].volume).toBe(.35);expect(decks[0].pause).toHaveBeenCalled();
 player.setVolume(.8,true);tick?.(600);expect(decks[1].volume).toBe(0);
 expect(await player.switch('https://example.com/two')).toBe(true);tick?.(600);expect(decks[0].volume).toBe(0);player.destroy();expect(decks.every(d=>d.removeAttribute.mock.calls.length>0)).toBe(true);
});
it('an earlier play promise cannot pause a newer stream reusing the same deck',async()=>{
 let firstResolve:(()=>void)|undefined;
 vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1));vi.stubGlobal('cancelAnimationFrame',vi.fn());
 vi.stubGlobal('Audio',class {volume=1;src='';play=vi.fn().mockResolvedValue(undefined);pause=vi.fn();load=vi.fn();removeAttribute=vi.fn();addEventListener=vi.fn();constructor(){decks.push(this)}});
 const player=new RadioAudio();decks[1].play.mockImplementationOnce(()=>new Promise<void>(resolve=>{firstResolve=resolve}));
 const first=player.switch('https://example.com/one');await player.switch('https://example.com/two');await player.switch('https://example.com/three');
 const paused=decks[1].pause.mock.calls.length;firstResolve?.();expect(await first).toBe(false);expect(decks[1].pause).toHaveBeenCalledTimes(paused);player.destroy();
});
