export type LiquidInstance={destroy:()=>void;markChanged:(element?:HTMLElement)=>void};
export type LiquidLibrary={LiquidGlass:{init:(options:{root:HTMLElement;glassElements:HTMLElement[];defaults:Record<string,number|boolean>})=>Promise<LiquidInstance>}};
let library:Promise<LiquidLibrary>|null=null;
/** Upstream's documented bundled ESM distribution; pinned, never evaluated on SSR. */
export function loadLiquidGlass(){
 if(!library){const url='https://cdn.jsdelivr.net/npm/@ybouane/liquidglass@1.0.3/dist/index.js';library=import(/* webpackIgnore: true */ url).then(module=>{if(typeof module.LiquidGlass?.init!=='function')throw new Error('LiquidGlass module unavailable');return module as LiquidLibrary}).catch(error=>{library=null;throw error})}
 return library;
}
