# BREATHE

Explore the air we share. BREATHE combines a realistic interactive Earth, sourced air quality, local radio and tools for understanding pollution over time.

Built for **Lets Code Diwali Challenge 2026: Breathe Better**, theme: Technology for Cleaner Air. Individual entry. **Production:** https://breathe-seven-alpha.vercel.app. The deployment is live; browser acceptance and measured performance remain pending.

## Run locally

Requires Node.js 22.12 or newer and npm. Install from the committed lockfile:

```sh
npm ci
test -f .env.local || cp .env.example .env.local
npm run dev
```

Add your OpenAQ key to `.env.local`. Obtain it through the [OpenAQ platform](https://explore.openaq.org/). Modeled air quality and radio do not require an API key. Never commit `.env.local` or prefix a secret with `NEXT_PUBLIC_`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `WAQI_API_TOKEN` | For reported station AQI | Server-only WAQI geo feed; obtain your own token at https://aqicn.org/data-platform/token/ |
| `OPENAQ_API_KEY` | For station measurements | Server-only OpenAQ v3 requests |
| `OPENAI_API_KEY` | Optional | Server-only grounded conversational explanations; sourced summary fallback without it |
| `OPENAI_MODEL` | Optional | Responses API model; defaults to `gpt-4.1-mini` |
| `BIGDATACLOUD_API_KEY` | Optional | Keyed server reverse geocoding for arbitrary globe pins; coordinates/search still work without it |
| `UPSTASH_REDIS_REST_URL` | For shared quotas | Server-only Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | For shared quotas | Server-only write-capable quota token |

```sh
npm run check
npm run build
npm start
```

`check` runs ESLint, TypeScript, unit/component tests and a production webpack build. Production uses webpack because the restricted development environment prevents Turbopack's CSS worker from binding a port. The production-only service worker requires HTTPS or localhost; test offline behavior with the production server rather than HMR.

## Features and acceptance status

“Implemented” describes shipped source, not a claim of completed browser or live-provider verification.

| Requirement | Implementation |
| --- | --- |
| Live dashboard | Recent measured particle AQI first (EPA NowCast from OpenAQ hourly PM observations); explicit live-unavailable state; CAMS model estimate in a separate disclosure |
| Interactive map | Lazy 3D Earth, 2D MapLibre alternative, search, geolocation, four pins, sampled hotspots and cleaner/higher city lists |
| History | Recent daily summaries, two-date comparison, PM2.5/PM10 chart and rolling 2σ spike flags |
| Location comparison | Up to four places, modeled AQI ranking, pollutant differences and overlaid trends |
| Health | Category explanations, activity and sensitive-group guidance, general-information disclaimer |
| Forecast | Distinct hourly/daily forecast series and time scrubber |
| Local radio | HTTPS streams, previous/next, list, mute, volume, two-deck crossfade and error skipping |
| Diwali Effect | 2024–2026 date selection, ±72-hour modeled windows, festival marker, coverage, peaks and before/after change |
| Cigarette approximation | Complete 24-hour PM2.5 mean divided by 22; method and limitations disclosed |
| Layers | AQI, pins, hotspots, calculated day/night terminator and optional modeled wind particles |
| Roulette and breathing | Fresh Good-air destinations; 1/3/5-minute guided breathing with radio ducking |
| UI sounds | Separate opt-in synthesized sound controls |
| Sharing | Validated coordinate/time/layer links and dynamic Open Graph image |
| PWA/offline | Manifest/install prompt, Workbox shell cache with native fallback and first-visit warming; IndexedDB air, station and Diwali responses |
| Smart alerts | User thresholds, locally persisted crossings, in-app status and opt-in browser notifications while the app is open |
| AI assistant / insights | Optional server-grounded OpenAI explanations; trend summary fallback with no AI key or provider failure |
| Shareable card | PNG via optional html-to-image, native-canvas fallback and Web Share/download |
| Impact report | Printable sourced report with current pollutants, historical daily summaries and browser PDF export |
| Voice assistant | Opt-in browser recognition, matching-place selection and sourced spoken summary; browser support varies |
| ML prediction | Experimental ridge regression on modeled history + weather; chronological holdout MAE and baseline, explicit ML ESTIMATE / FORECAST labels |
| Additional bonuses | Geolocation, loaded-city cleaner-air ranking, anomaly flags and multi-API integration |

The header offers **Home** and **Radio** navigation. Diwali, insights, toolkit and breathing panels include **Back to globe** and **Radio** controls. Radio closes overlays, scrolls to the player and moves keyboard focus without changing playback settings.

## Data integrity

No AQI readings are embedded in the city catalog or replaced with invented values. Missing values remain **No data** or **N/A**. The primary scale is **US AQI**. Open-Meteo's AQI is a model estimate. The current location card prioritizes a **measured particle AQI (US)** calculated from OpenAQ hourly PM2.5/PM10 observations using EPA's particle NowCast and 2024 breakpoints. It requires at least two of the latest three completed hours, uses up to 12 hours, and accepts only unflagged one-hour aggregates with at least 75% coverage and explicit µg/m³ units. Concentrations are truncated before subindex interpolation. The highest available particle subindex is shown; this is not an official all-pollutant city AQI. Values beyond the published scale show >500. Raw instantaneous concentrations remain separate. If valid recent hours are missing, the primary card says **Live AQI unavailable**, never substituting the model number. The globe, history, forecasts, comparison and assistant remain explicitly modeled.

Values distinguish **MEASURED**, **MODELED**, **FORECAST**, **HISTORICAL** and **STALE**. Stale responses preserve their original times and show **Not live**. A valid time describes the reading or forecast hour; retrieval time describes when the server obtained it. Daily history is a summary of available hourly AQI, not a regulatory daily AQI calculation. Charts preserve missing hours.

Provider calls go through server routes. Normalized server responses are cached for 10–30 minutes. Retry logic uses bounded exponential delays and respects provider cooldown headers. Client failures retain available data with stale treatment; persisted air, station and Diwali responses are a fallback. Shared minute/hour reservations for OpenAQ and the assistant use atomic Redis scripts when configured. OpenAQ cooldowns are shared as well. Without Redis, development uses a bounded per-process fallback; Vercel AI explanations fall back to the sourced summary until shared limiting is configured. Configured quota-store failures do not silently bypass limiting. Budgets apply only to this application; use a dedicated upstream key.

Diwali comparisons use a disclosed 18:00 IST analytical anchor, not a claimed ritual time. Future hours are excluded from observed historical comparisons, and incomplete windows are marked in progress. Association around the festival does not establish fireworks or any other factor as the proven cause. Pre-2022 years are disabled because the global CAMS archive begins in August 2022; individual requested windows can still be unavailable.

## Architecture

```mermaid
flowchart TD
  UI[Next.js client interface] --> State[Zustand and TanStack Query]
  State --> Routes[Server API routes]
  Routes --> Cache[Normalized response cache]
  Cache --> Air[Open-Meteo air and weather]
  Cache --> Stations[OpenAQ v3]
  Cache --> Radio[Radio Browser]
  Cache --> Search[Open-Meteo geocoding]
  State --> Offline[IndexedDB stale fallback]
```

The assistant fetches grounding data on the server instead of trusting client-submitted readings. Generated prose is rejected if it contains numeric quantities; sourced numeric values are rendered separately. AI explanations remain fallible and are identified as such. Without a key, the assistant gives a deterministic data summary, not a simulated AI response.

The ML experiment fits only historical CAMS targets paired with weather, tests on the last 24 complete chronological pairs, then refits for at most six future hours. Missing inputs produce no estimate. Its error is against held-out model values, not station truth; the UI discloses when a previous-day baseline outperforms it. Alerts only monitor the active pin while the app is open/connected and never trigger from stale data. Speech recognition may send audio to the browser vendor; listening is opt-in and recordings are not stored by BREATHE.

`src/app/api` contains provider proxies and generated images. `src/lib` contains typed data normalization, validation, calculations and caching helpers. `src/components` contains the globe, player and lazy analysis panels. `public` contains local textures and the service worker. The explorer and toolkit load on demand; heavy globe/charts/wind features load separately; low-power and reduced-motion settings suppress expensive effects.

## Sources and credits

- [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api): CAMS modeled concentrations, US AQI, forecasts and history. Credit Open-Meteo and the Copernicus Atmosphere Monitoring Service. Check provider usage terms before commercial deployment.
- [Open-Meteo Weather](https://open-meteo.com/en/docs): modeled wind speed and direction. Particles exaggerate movement for visibility and do not model pollution transport.
- [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api): city lookup using GeoNames geographic data.
- [EPA AQI breakpoints](https://aqs.epa.gov/aqsweb/documents/codetables/aqi_breakpoints.html) and [AirNow NowCast methodology](https://docs.airnowapi.org/aq101): measured particle index calculation, not a claim of regulatory certification.
- [OpenAQ v3](https://docs.openaq.org/): station measurements; attribution to underlying providers is shown when supplied. Availability, reporting time and licenses vary by station/provider.
- [BigDataCloud](https://www.bigdatacloud.com/docs/reverse-geocoding/reverse-geocode-to-city-api): optional keyed server reverse geocoding. Its free client-only endpoint is deliberately not used for arbitrary/stored globe coordinates; see the [current usage policy](https://www.bigdatacloud.com/docs/article/why-is-reverse-geocoding-api-free). No public Nominatim service is called.
- [Radio Browser](https://api.radio-browser.info/): community directory. DNS-discovered mirrors, descriptive User-Agent and playback click registration. Streams remain controlled by their broadcasters.
- [three-globe](https://github.com/vasturiano/three-globe): bundled example Earth textures, including Blue Marble imagery; bundled MIT license in `public/textures`.
- [LiquidGlass by ybouane](https://github.com/ybouane/liquidglass): MIT button effects, version 1.0.3 loaded from a pinned CDN with a readable native-control fallback. Buttons use the upstream **Frosted Panel** recipe (`blurAmount: 0.25`, `cornerRadius: 30`) with button feedback enabled. Only empty decorative surfaces enter its renderer; native labels, focus and click handlers remain independent. CSS backdrop blur provides the real-page frosted fallback; the per-group WebGL capture uses a small neutral scene instead of repeatedly rasterizing the whole globe.
- [Upstash Redis REST](https://upstash.com/docs/redis/features/restapi): optional shared, atomic OpenAQ/assistant quota reservations and provider cooldowns; server-only credentials.
- [OpenAI Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create): optional grounded explanations; server-only key, `store: false`, request timeout and explicit summary fallback.
- [html-to-image](https://github.com/bubkoo/html-to-image): optional MIT PNG renderer, pinned to 1.11.13; native canvas fallback works without it.
- [Geist](https://github.com/vercel/geist-font): locally served regular font through Next.js; SIL OFL 1.1. See [third-party notices](docs/THIRD_PARTY_NOTICES.md).
- [Workbox](https://developer.chrome.com/docs/workbox/): service-worker caching, version 7.3.0 loaded from its CDN.
- [AirNow](https://www.airnow.gov/aqi/aqi-basics/): US AQI category and general health context.
- [Berkeley Earth](https://berkeleyearth.org/air-pollution-and-cigarette-equivalence/): approximate PM2.5 cigarette equivalence. This is a population-level rule of thumb, not an individual medical-risk calculation.
- Festival dates checked against [timeanddate India holidays](https://www.timeanddate.com/holidays/india/diwali) and the India Post 2026 holiday calendar during implementation.

Third-party libraries and public datasets retain their own licenses and authorship. See the in-app **Data & credits** panel. Development history is recorded in [docs/PHASES.md](docs/PHASES.md).

## Deploy to Vercel

Use [docs/RELEASE_RUNBOOK.md](docs/RELEASE_RUNBOOK.md) for the complete preview → verification → screenshots/Lighthouse → production sequence. `npm run release:doctor -- --url https://YOUR-DEPLOYMENT.vercel.app` records prerequisites/API checks without exposing secrets; `npm run release:lighthouse -- report.json https://YOUR-DEPLOYMENT.vercel.app` validates an actual desktop audit.

1. Push this repository to your Git provider and import it into Vercel as a Next.js project, or run `npx vercel` from this directory.
2. Set `OPENAQ_API_KEY`, shared quota variables `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (and optional `OPENAI_API_KEY`, `OPENAI_MODEL`, `BIGDATACLOUD_API_KEY`) in Vercel's encrypted environment settings for the desired environments. Do not upload `.env.local`.
3. Use Node.js 24 (or another supported version meeting the engine requirement), install with `npm ci`, and build with `npm run build`. Keep the default Next.js output settings.
4. Review the preview deployment with [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md), then promote it or run `npx vercel --prod`.
5. Check live provider responses and HTTPS radio playback on the deployed origin. Confirm source times, stale behavior, mobile layout and service-worker updates before submission.

Production is live at **https://breathe-seven-alpha.vercel.app** under `shubhang-aarya09/breathe`. OpenAQ and OpenAI credentials are encrypted in Production and Preview. HTTP checks verified modeled AQI, six nearby station pollutants, city search, HTTPS radio directory results, manifest and service-worker headers. Shared Redis is not configured, so Vercel AI explanations use the sourced summary fallback. See [deployment evidence](docs/DEPLOYMENT.md). A live deployment does not certify browser visuals, playback, offline reload or Lighthouse performance. GitHub Actions checks are included in `.github/workflows/ci.yml` and will run when this repository is pushed.

## Known limitations

- Browser QA, actual GPU shader compilation, radio autoplay/crossfade, mobile touch behavior, install/offline reload and Lighthouse performance have not been certified. The desktop performance ≥85 target is unmeasured.
- Radio autoplay can require pressing Play despite the entry gesture. Discovery prefers nearby, state, country, then distant geographic alternatives. Search results supply region/country directly; arbitrary pins need the optional reverse-geocoding key to add that metadata. Broadcasters may stop or reject streams.
- OpenAQ does not guarantee current station coverage for every city. Riyadh returned observations dated August 2021 during this investigation; these are stale, not live. Different providers may use different monitors, averaging windows and coverage, so values are not guaranteed to match AQI.in. Recent station metadata is preferred over inactive nearby stations; station responses have a 10-minute server cache and the client checks every minute while open.
- OpenAQ searches fixed stations within 25 km and paginates directory/latest results in pages of 1,000 with a 20-page request budget. Exceeding the budget fails explicitly rather than claiming a nearest station from partial results. Available owner/license/attribution metadata is shown; missing metadata remains explicit. Cross-instance request budgeting is implemented through the optional shared Redis configuration and must be verified against the deployed store; local fallback alone is not distributed protection.
- City/grid sampling is intentionally coarse. Rankings cover available loaded locations, not all cities worldwide. Wind is a coarse current model visualization.
- Offline persistence covers modeled air, OpenAQ and festival responses, with original timestamps and explicit stale flags. Radio is unavailable offline. Initial offline access requires a successful prior online visit and service-worker installation; first-visit shell/asset warming and a native CDN-failure fallback are implemented, but actual offline reload remains a browser acceptance check.
- Source timestamps can lag; provider/model estimates and station measurements may disagree. Health guidance is general information, not medical advice.
- Optional AI and arbitrary-pin city naming require their respective server keys. Voice recognition, notification permission, PNG sharing and PDF printing depend on browser capabilities. The assistant uses the documented HTTPS API directly because package registry DNS is blocked here; credentials never reach the client.

## Demo and screenshots

Use [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the 2–3 minute demonstration. Screenshot capture is pending a browser-capable session; [docs/screenshots/README.md](docs/screenshots/README.md) lists the required captures. No fabricated screenshot or unmeasured performance score is presented.


## Reported live station AQI (WAQI)

Set WAQI_API_TOKEN in Vercel Production and Preview and redeploy. The current location card prefers a recent WAQI-reported US AQI from a station returned by its geo lookup within 500 km, displaying its name, distance, observation time and originating provider attribution. Values more than two hours old or in the future are excluded from live display; invalid/missing AQI is never replaced with a model estimate. WAQI pollutant fields are AQI subindices, not µg/m³ concentrations. OpenAQ particle NowCast remains the fallback where available. The modeled globe/history/forecast remain separate. A token does not guarantee coverage in every location.

[WAQI API terms](https://aqicn.org/api/) require your own token, attribution to WAQI and the originating provider, restrict paid usage and cached/archived redistribution, and require prior notification for public nonprofit usage. Review applicability before activation. Unlike other data endpoints, /api/live-aqi uses no-store at the provider, route and CDN, bypasses IndexedDB and service-worker data caching, and is unavailable offline. This provider-specific handling follows its usage restrictions. No WAQI API token is included in source or examples.

Regional coverage: station reports beyond 50 km are explicitly titled Nearest regional station AQI and marked Regional reference only — not a measurement at your pin. A 500 km upper bound rejects geographically unrelated results. WAQI unavailable/error/offline states remain visible above the separate OpenAQ fallback, with a Retry WAQI action. Availability and recency checks still apply; no numbers are invented for unmonitored areas.
