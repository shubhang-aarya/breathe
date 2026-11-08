# Finish the BREATHE release

This runbook separates implemented checks from evidence that must come from a running production build. Never mark a browser or deployment check complete merely because source tests pass.

## 1. Configure the deployed environment

The existing `.env.local` stays local and is not uploaded with source. In Vercel Project Settings → Environment Variables, configure the corresponding **Preview** and **Production** environments:

| Name | Purpose |
| --- | --- |
| `OPENAQ_API_KEY` | Nearby station observations |
| `OPENAI_API_KEY` | Optional grounded AI explanations |
| `OPENAI_MODEL` | Optional model override; default `gpt-4.1-mini` |
| `BIGDATACLOUD_API_KEY` | Optional keyed reverse geocoding for arbitrary globe pins |
| `UPSTASH_REDIS_REST_URL` | Shared quota store HTTPS endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Shared quota store write-capable REST token |

A Vercel Marketplace connection can inject `KV_REST_API_URL` and `KV_REST_API_TOKEN`; the server recognizes that pair automatically when no custom `UPSTASH_*` pair is configured. A partially configured custom pair is rejected rather than mixed with another store’s token.

Use a persistent Upstash Redis database from your account or Vercel Marketplace. Do not use a temporary expiring database for the final submission. Values go only into server environment settings; never paste keys into chat, source, URLs, screenshots or shell arguments.

The shared limiter reserves minute/hour capacity atomically for the assistant and OpenAQ requests. It also preserves OpenAQ cooldowns across instances. Without Redis, development uses a bounded in-process fallback. On Vercel, paid AI explanations require shared limiting and otherwise return the sourced summary. If configured Redis fails, requests fail closed rather than bypassing it. OpenAQ budgets are deliberately conservative (30/minute and 1,000/hour for this application); use a dedicated key, because activity in other applications sharing that key is outside this budget.

References: [Upstash REST](https://upstash.com/docs/redis/features/restapi), [EVAL](https://upstash.com/docs/redis/sdks/ts/commands/scripts/eval), [OpenAQ limits](https://docs.openaq.org/using-the-api/rate-limits).

## 2. Create the preview from a network-enabled Terminal

Run from the BREATHE directory:

```sh
npm run check
npx vercel login
npx vercel link
npx vercel
```

Choose the intended personal/team account and project when the CLI asks. Add the server environment variables above through Vercel's settings, then redeploy the preview so they take effect. A preview without OpenAQ credentials can still show modeled AQI, but does not pass station-integration acceptance.

Keep deployment protection enabled if needed. For protected previews, use a browser signed into the project or the official `vercel curl` workflow. The public smoke verifier does not bypass protection and will report protected responses as incomplete. Do not put authentication bypass tokens in a report URL.

## 3. Run the diagnostic and smoke checks

For local production checks, stop the development server first and run:

```sh
npm run build
npm start -- --port 3001
```

In a second Terminal:

```sh
npm run release:doctor -- --url http://localhost:3001
```

For a public production/preview origin:

```sh
npm run release:doctor -- --url https://YOUR-DEPLOYMENT.vercel.app
```

The report is written to `artifacts/release/doctor.json`. It contains statuses and configuration-presence flags, never credential values. The script checks runtime prerequisites, network reachability, the app shell, manifest, service-worker response, modeled-data schema, Phagwara search and station API. Real missing station coverage is allowed; absent station credentials are not station acceptance. It makes no AI calls, does not play radio and does not deploy. It exits nonzero when required checks fail or remain blocked. Locally present secrets do not prove the same variables exist on Vercel.

## 4. Browser acceptance, screenshots and demo

Use [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) on the actual preview. Inspect desktop, 768 px and 390 px layouts. Confirm the modal header cannot collide with application navigation and only the panel body scrolls. Check keyboard exits and the Radio shortcut, actual GPU rendering, radio playback/crossfade, permission-denied states, PNG/PDF output and install/offline reload. Do not hammer provider APIs to test rate limiting; use controlled responses or an isolated test quota store.

For offline testing, first visit online, pin a location and allow the service worker to finish warming assets. Confirm it controls the page, go offline and reload. Verify STALE / Not live with the original retrieval time. Reconnect and confirm refresh and radio recovery. The install prompt may be unavailable on browsers that use an install menu; document the tested browser.

Capture the real app screenshots in `docs/screenshots/README.md`, then add references in the main README. Use `docs/DEMO_SCRIPT.md` to record the 2–3 minute walkthrough. Recorded audio, browser permissions and visual appearance require actual device/browser acceptance; source tests cannot certify them.

## 5. Measure desktop Lighthouse

Use Chrome DevTools → Lighthouse on the deployed production build, choose **Desktop**, and save the JSON and HTML reports. A Node CLI alternative is documented by [Lighthouse](https://github.com/GoogleChrome/lighthouse#using-the-node-cli):

```sh
mkdir -p artifacts/release
npx lighthouse https://YOUR-DEPLOYMENT.vercel.app --preset=desktop --output=json --output=html --output-path=artifacts/release/lighthouse
npm run release:lighthouse -- artifacts/release/lighthouse.report.json https://YOUR-DEPLOYMENT.vercel.app
```

The verifier requires a successful desktop report for the expected origin and performance ≥85. Keep the actual Lighthouse version, audit time and hardware context. Audit the initial page and manually inspect performance after entering the globe; an entry-page score does not prove 60 fps in the globe. Synthetic reports in unit tests are explicitly tool-contract fixtures, not measured app scores.

## 6. Publish the validated build

After reviewing failures, screenshots and browser evidence:

```sh
npx vercel --prod
```

Ensure Production has the same intended environment configuration; a preview environment does not automatically prove production configuration. Rerun the smoke checks and the browser smoke flow against the production URL. Record that URL, tested commit, browser versions, reports and remaining limitations. Only then mark the final release complete.
