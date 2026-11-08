/** Approximate subsolar point from NOAA fractional-year equations (UTC).
 * https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 * For visual context, not navigation or precise sunrise predictions.
 */
export function subsolarPoint(time:number){
 if(!Number.isFinite(time))throw new Error('Invalid solar time');
 const date=new Date(time),year=date.getUTCFullYear();const days=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
 const day=Math.floor((time-Date.UTC(year,0,1))/86400000)+1;const hours=date.getUTCHours()+date.getUTCMinutes()/60+date.getUTCSeconds()/3600;
 const gamma=2*Math.PI/days*(day-1+(hours-12)/24);
 const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
 const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
 const raw=180-(hours*60+eq)/4;return {lat:decl*180/Math.PI,lon:((raw+180)%360+360)%360-180};
}
