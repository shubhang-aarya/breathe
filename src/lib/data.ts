export const dataKinds = ["MEASURED", "MODELED", "FORECAST", "HISTORICAL", "STALE"] as const;
export type DataKind = typeof dataKinds[number];
export type Reading = {value:number|null;unit:string;kind:DataKind;source:string;observedAt:string;fetchedAt:string};
export function formatReading(value:number|null|undefined){return typeof value === "number" && Number.isFinite(value) ? Math.round(value).toString() : "No data";}
