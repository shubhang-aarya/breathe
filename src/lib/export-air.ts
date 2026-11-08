import { category, pollutants, type Air } from './air';
import { daily, mean } from './analytics';
import { airColor } from './air-color';
import { isFreshAir } from './air-summary';
export function exportRows(air: Air) {
  const end = Date.parse(air.observedAt ?? '');
  return daily(air.hours.filter(h => Date.parse(h.time) <= end));
}
export function escapeHtml(value: string) { return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!); }
export function reportHtml(air: Air, now = Date.now()) {
  const rows = exportRows(air), stale = !isFreshAir(air, now);
  const v = (n: number | null | undefined) => n == null ? 'No data' : n.toFixed(1);
  const cells = rows.map(d => `<tr><td>${escapeHtml(d.date)}</td><td>${v(d.aqi)}</td><td>${v(d.pm25)}</td><td>${v(d.pm10)}</td><td>${d.hours}/24</td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>BREATHE air quality report</title><style>body{font:16px system-ui;line-height:1.6;color:#17211c;max-width:850px;margin:40px auto;padding:20px}h1{font-size:36px}table{border-collapse:collapse;width:100%;margin:24px 0}td,th{padding:10px;text-align:left;border-bottom:1px solid #ccd2ce}small{color:#415149}.badge{border:1px solid;padding:4px 10px} @media print{body{margin:0;padding:0}}</style></head><body><p>BREATHE · POLLUTION IMPACT REPORT</p><h1>${escapeHtml(air.place.name)}</h1><p><span class="badge">MODELED</span> ${stale ? '<strong>STALE · Not live</strong>' : ''}</p><h2>US AQI ${v(air.aqi)} · ${category(air.aqi)}</h2><p>Source: ${escapeHtml(air.source)}<br>Valid time: ${escapeHtml(air.observedAt ?? 'unavailable')}<br>Retrieved: ${escapeHtml(air.fetchedAt)}<br>Report generated: ${new Date(now).toISOString()}</p><h2>Current modeled concentrations</h2><table><thead><tr><th>Pollutant</th><th>µg/m³</th></tr></thead><tbody>${pollutants.map(p => `<tr><th>${p}</th><td>${v(air.pollutants[p])}</td></tr>`).join('')}</tbody></table><h2>Historical modeled daily summaries · UTC</h2><p>Mean of available daily means: ${v(mean(rows.map(d => d.aqi)))}. Summaries are not regulatory daily AQI; partial days retain their counts.</p><table><thead><tr><th>UTC day</th><th>Mean US AQI</th><th>PM2.5 µg/m³</th><th>PM10 µg/m³</th><th>AQI hours</th></tr></thead><tbody>${cells || '<tr><td colspan="5">No historical data</td></tr>'}</tbody></table><p>Model estimates are not station measurements. This report describes available concentrations and trends; it does not establish causes, personal exposure or health outcomes. General information, not medical advice. Follow local public-health advice.</p><small>Sources: Open-Meteo / Copernicus Atmosphere Monitoring Service; health context: airnow.gov. Forecast hours are excluded from historical summaries.</small></body></html>`;
}
export function printReport(air: Air) {
  const frame = document.createElement('iframe');
  frame.title = 'Printable BREATHE report'; frame.style.cssText = 'position:fixed;left:-10000px;width:900px;height:800px;border:0';
  frame.onload = () => { frame.contentWindow?.focus(); frame.contentWindow?.print(); };
  frame.srcdoc = reportHtml(air); document.body.append(frame);
  setTimeout(() => frame.remove(), 60000);
}
function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image export unavailable')), 'image/png'));
}
export async function shareAirCard(node: HTMLElement, air: Air, offline: boolean) {
  let blob: Blob | null = null;
  if (!offline) try {
    const url = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/+esm';
    const renderer = await Promise.race([import(/* webpackIgnore: true */ url), new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error("Renderer timeout")),5000))]) as { toBlob: (node: HTMLElement, options: object) => Promise<Blob | null> };
    blob = await renderer.toBlob(node, { pixelRatio: 2, backgroundColor: '#0c151b', skipFonts: true });
  } catch { /* Native canvas remains available without the optional renderer. */ }
  if (!blob) {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 680;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Image export unavailable');
    ctx.fillStyle = '#0c151b'; ctx.fillRect(0, 0, 1200, 680); ctx.fillStyle = '#ecf1ec';
    ctx.font = '28px sans-serif'; ctx.fillText('B R E A T H E', 64, 80);
    ctx.font = '38px sans-serif'; ctx.fillText(air.place.name.slice(0, 48), 64, 155);
    ctx.fillStyle = airColor(air.aqi); ctx.font = 'bold 120px sans-serif'; ctx.fillText(String(air.aqi ?? 'No data'), 64, 300);
    ctx.fillStyle = '#ecf1ec'; ctx.font = '32px sans-serif'; ctx.fillText(`${category(air.aqi)} · US AQI`, 64, 370);
    ctx.font = '24px sans-serif';
    for (const [index, line] of ['MODELED' + (offline || !isFreshAir(air) ? ' · STALE · Not live' : ''), air.source, `Valid: ${air.observedAt ?? 'unavailable'}`, `Retrieved: ${air.fetchedAt}`].entries()) ctx.fillText(line, 64, 445 + index * 44);
    blob = await canvasBlob(canvas);
  }
  const file = new File([blob], 'breathe-air-quality.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'BREATHE air quality' }); return 'Shared'; }
    catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return 'Sharing cancelled'; }
  }
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = file.name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'PNG downloaded';
}
