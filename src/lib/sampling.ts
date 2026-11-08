import type { Place } from './air';
/** A coarse global grid; coordinates are geography, never synthetic readings. */
export const grid:Place[]=Array.from({length:7},(_,row)=>-60+row*20).flatMap(lat=>Array.from({length:12},(_,col)=>({lat,lon:-180+col*30,name:`Grid ${lat}°, ${-180+col*30}°`})))
export const gridBatchSize=14;
export const gridBatchCount=Math.ceil(grid.length/gridBatchSize);
