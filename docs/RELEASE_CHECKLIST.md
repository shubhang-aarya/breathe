# Release acceptance

Automated checks and deployment/browser acceptance are separate. Run `npm run check` after code changes. Use a production build for service-worker tests.

- [ ] Deploy a Vercel preview with server-only OpenAQ credentials; verify no secret appears in HTML, JS or git.
- [ ] Confirm live Open-Meteo/OpenAQ responses, correct units, null/zero handling, observation and retrieval times, and honest unavailable states.
- [ ] Test 429 cooldowns and network failures without repeatedly calling live providers; use controlled responses.
- [ ] Inspect entry and explorer at 390 px, 768 px and desktop widths; ensure visible button labels, no overlap and no horizontal overflow.
- [ ] Exercise globe drag, fly-to, four pins, 2D fallback, scrubber, terminator and low-power mode. Inspect browser console for actual shader errors.
- [ ] Navigate search entirely by keyboard; test a city outside the built-in list, such as Phagwara. Verify focus return, Escape, dialogs and screen-reader labels.
- [ ] Test local radio Play, mute, volume, next/previous, stream error skip and crossfade on desktop and mobile; confirm mute persists.
- [ ] Inspect history/forecast distinction, comparison missing data and Diwali coverage; ensure future hours do not masquerade as history.
- [ ] Verify breathing only unlocks on fresh Good-air data; test radio volume restoration, reduced motion and UI sound opt-in.
- [ ] Copy/reload coordinate/time/layer links, including malformed parameters; inspect generated Open Graph image.
- [ ] Install the PWA; visit a location online, go offline and reload. Confirm original timestamps, prominent STALE / Not live, no offline radio and restored data. Verify a service-worker update after redeploy.
- [ ] Check keyboard focus, zoom to 200%, color contrast and reduced-motion settings.
- [ ] Run desktop Lighthouse on the deployed production page; record environment, date and scores. Target performance ≥85; do not infer it from build success.
- [ ] Capture actual screenshots listed in `screenshots/README.md`, update README references and record the demo.
- [ ] Record deployed URL and final commit; promote only after reviewing failures and remaining limitations.

Unverified items stay unchecked. This document is a test plan, not evidence of passing those checks.
