/** EPA particle NowCast and current EPA AQI breakpoints. Not an all-pollutant city index. */
export type Particle = 'pm25' | 'pm10';
export type MeasuredHour = { time: string; value: number };
export type ParticleIndex = { aqi: number | null; aboveScale: boolean; observedAt: string; basis: Particle[]; hoursUsed: number; method: 'EPA particle NowCast (2024 breakpoints)' };
const hour = 3600000;
const indexBands = [[0,50],[51,100],[101,150],[151,200],[201,300],[301,500]];
const concentrations: Record<Particle, number[][]> = {
  pm25: [[0,9],[9.1,35.4],[35.5,55.4],[55.5,125.4],[125.5,225.4],[225.5,325.4]],
  pm10: [[0,54],[55,154],[155,254],[255,354],[355,424],[425,604]],
};
export function particleSubindex(value: number, particle: Particle) {
  if (!Number.isFinite(value) || value < 0) return null;
  const scale = particle === 'pm25' ? 10 : 1, concentration = Math.floor(value * scale + 1e-9) / scale;
  const band = concentrations[particle].findIndex(([low,high]) => concentration >= low && concentration <= high);
  if (band < 0) return { aqi: null, aboveScale: concentration > concentrations[particle].at(-1)![1] };
  const [low,high] = concentrations[particle][band], [from,to] = indexBands[band];
  return { aqi: Math.round((to-from)/(high-low)*(concentration-low)+from), aboveScale: false };
}
export function particleNowCast(rows: MeasuredHour[], now = Date.now()) {
  // Hourly aggregates may follow local civil hours (e.g. :30 UTC in India).
  const completed = rows.filter(row => Number.isFinite(Date.parse(row.time)) && Date.parse(row.time) <= now && Number.isFinite(row.value) && row.value >= 0);
  if (!completed.length) return null;
  const offset = Math.max(...completed.map(row => Date.parse(row.time))) % hour;
  const end = Math.floor((now-offset)/hour)*hour+offset, available = new Map<number, number>();
  for (const row of completed) { const time = Date.parse(row.time); if ((end-time) % hour === 0 && time <= end && time > end-12*hour) available.set(time,row.value); }
  if ([0,1,2].filter(age => available.has(end-age*hour)).length < 2) return null;
  const values = [...available.values()], maximum = Math.max(...values), minimum = Math.min(...values);
  const weight = maximum === 0 ? 1 : Math.max(.5,minimum/maximum);
  let numerator = 0, denominator = 0;
  for (const [time,value] of available) { const w = weight ** ((end-time)/hour); numerator += value*w; denominator += w; }
  const observedAt = new Date(Math.max(...available.keys())).toISOString();
  return { concentration: numerator/denominator, observedAt, hoursUsed: available.size };
}
export function measuredParticleIndex(series: Partial<Record<Particle, MeasuredHour[]>>, now = Date.now()): ParticleIndex | null {
  const indices = (['pm25','pm10'] as const).flatMap(particle => { const cast = particleNowCast(series[particle]??[],now); const index = cast && particleSubindex(cast.concentration,particle); return cast && index ? [{particle,...cast,...index}] : []; });
  if (!indices.length) return null;
  const dominant = [...indices].sort((a,b) => Number(b.aboveScale)-Number(a.aboveScale)||(b.aqi??-1)-(a.aqi??-1))[0];
  // Both component timestamps must be disclosed conservatively, not just the newest sensor.
  return { aqi: dominant.aqi, aboveScale: dominant.aboveScale, observedAt: new Date(Math.min(...indices.map(i=>Date.parse(i.observedAt)))).toISOString(), basis: indices.map(i=>i.particle), hoursUsed: Math.min(...indices.map(i=>i.hoursUsed)), method: 'EPA particle NowCast (2024 breakpoints)' };
}
export function parseMeasuredHours(raw: unknown, particle: Particle): MeasuredHour[] {
  if (!Array.isArray(raw)) return [];
  const names = particle === 'pm25' ? ['pm25','pm2.5'] : ['pm10'];
  return raw.flatMap(row => {
    if (!row || typeof row !== 'object' || typeof row.value !== 'number' || !Number.isFinite(row.value) || row.value < 0 || !names.includes(row.parameter?.name?.toLowerCase()) || typeof row.parameter?.units !== 'string') return [];
    const unit = row.parameter.units.toLowerCase().replace(/[µμ]/g,'u').replace(/³/g,'3').replace(/\s/g,'');
    const from = Date.parse(row.period?.datetimeFrom?.utc??''), to = Date.parse(row.period?.datetimeTo?.utc??'');
    const coverage = row.coverage?.percentCoverage;
    if (unit !== 'ug/m3' || !Number.isFinite(from) || !Number.isFinite(to) || to-from !== hour || row.flagInfo?.hasFlags === true || typeof coverage !== 'number' || !Number.isFinite(coverage) || coverage < 75 || coverage > 100) return [];
    return [{time:new Date(to).toISOString(),value:row.value}];
  });
}
export function freshParticleIndex(index: ParticleIndex | null | undefined, now: number) {
  const time = Date.parse(index?.observedAt??'');
  return !!index && (index.aboveScale ? index.aqi===null : typeof index.aqi==='number'&&Number.isFinite(index.aqi)&&index.aqi>=0&&index.aqi<=500) && Number.isFinite(time) && time <= now && now-time <= 2*hour && index.hoursUsed >= 2;
}
