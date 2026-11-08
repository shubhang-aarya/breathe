# Production deployment

- Public URL: https://breathe-seven-alpha.vercel.app
- Account: `shubhang-aarya`
- Team/project: `shubhang-aarya09/breathe`
- Target/status: Production / READY
- Deployment ID: `dpl_FxUga4BTVyGtW6Zy2KgbkaGeuLBm`
- Immutable URL: https://breathe-6d6heu7k0-shubhang-aarya09.vercel.app
- Deployed application source: `769a161` (subsequent changes document deployment evidence)
- Verified on: 2026-11-08

The public production alias responds without authentication. Immutable deployment URLs retain Vercel authentication protection. Official authenticated Vercel CLI requests were used where needed; a successful protected request is not evidence of public access.

## Server configuration

`OPENAQ_API_KEY` and `OPENAI_API_KEY` were copied from existing local configuration into encrypted Vercel Production and Preview secrets without displaying the values. No local environment file was uploaded as source. The updated production build was then deployed.

`BIGDATACLOUD_API_KEY` and shared Redis credentials are not configured. Coordinate pins and search metadata remain functional. AI explanations intentionally use the grounded summary fallback on Vercel until shared limiting is configured; this was confirmed by the production endpoint. Redis integration itself still requires live-store verification.

## HTTP smoke evidence

| Check | Result |
| --- | --- |
| Public app shell | HTTP 200 |
| Modeled air endpoint | HTTP 200; Open-Meteo · CAMS / MODELED; original observation and retrieval timestamps present |
| Station endpoint | HTTP 200; Talkatora Garden, Delhi - DPCC; OpenAQ v3; six supported pollutant observations returned |
| City search | HTTP 200; two Phagwara matches returned |
| Radio directory | HTTP 200; six nearby stations; all stream URLs HTTPS |
| PWA manifest | HTTP 200; BREATHE name and two icons |
| Service worker | HTTP 200; no-cache/no-store/must-revalidate header |
| Assistant | HTTP 200; sourced summary mode; shared-limiter configuration explanation |

These checks exercise real deployed routes and providers. Directory results do not prove stream playback; a manifest does not prove install/offline behavior. Counts and station availability describe this check only and can change.

## Still unverified

Browser/mobile layout, actual GPU rendering, media playback/crossfade, notification/microphone permissions, installed-PWA offline reload, screenshots, recorded demo and measured desktop Lighthouse performance remain open. No score or browser acceptance is inferred from HTTP responses or a successful deployment.
