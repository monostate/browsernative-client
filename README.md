# @monostate/browsernative-client

> JavaScript/TypeScript client for a self-hosted node-scraper API

[![npm](https://img.shields.io/npm/v/@monostate/browsernative-client.svg)](https://www.npmjs.com/package/@monostate/browsernative-client)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/monostate/browsernative-client/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Zero-dependency client for scraping, screenshots, AI analysis and persistent
browser sessions, talking to an API **you host** that is built on
[`@monostate/node-scraper`](https://www.npmjs.com/package/@monostate/node-scraper).
Works in Node.js, browsers, and edge environments.

> **v3:** the hosted Browser Native API (bnca-api.fly.dev / bnca.monostate.ai)
> has been retired. There is no default endpoint any more: `baseUrl` is
> required and the API key is optional (only if your deployment checks one).
> See [Migrating from 2.x](#migrating-from-2x).

## Install

```bash
npm install @monostate/browsernative-client
```

## Usage

```javascript
import { BrowserNativeClient } from '@monostate/browsernative-client';

const client = new BrowserNativeClient({
  baseUrl: 'http://localhost:3001',   // your node-scraper API
  apiKey: process.env.SCRAPER_API_KEY, // optional: sent as x-api-key when set
});

// Scrape
const result = await client.scrape('https://example.com');
result.data.metadata?.contentStatus; // 'usable' | 'browser_required_shell' | 'blocked' | 'empty' | 'navigation_error'

// Force a specific scraping method
await client.scrape('https://example.com', { method: 'lightpanda' });

// Screenshot / quick screenshot
await client.screenshot('https://example.com');
await client.quickshot('https://example.com');

// AI Q&A (the API must be configured with a model provider)
await client.analyze('https://example.com', 'What is this site about?');
```

The 2.x call shape still works: `new BrowserNativeClient(apiKey, { baseUrl })`.

### Convenience functions

```javascript
import { quickScrape, quickShot, quickAnalyze, bulkScrape } from '@monostate/browsernative-client';

const api = { baseUrl: 'http://localhost:3001', apiKey: process.env.SCRAPER_API_KEY };
const content = await quickScrape('https://example.com', api);
const shot = await quickShot('https://example.com', api);
const answer = await quickAnalyze('https://example.com', 'What is this?', api);
```

### Bulk scraping

```javascript
const { results, stats } = await client.bulkScrape(urls, {
  concurrency: 5,
  continueOnError: true,
  progressCallback: (p) => console.log(`${p.percentage.toFixed(1)}%`),
});
```

## Hosting the API

This client speaks to an HTTP/WebSocket service with these routes, all
`POST` with a JSON body unless noted:

| Route | Body | Purpose |
|---|---|---|
| `/scrapeurl` | `{ url, method?, screenshot? }` | Scrape; response `{ success, data, metadata: { method, contentStatus, httpStatus, finalUrl, … } }` |
| `/quickshot` | `{ url }` | Fast screenshot |
| `/aireply` | `{ url, question }` | AI answer about a page |
| `/bulk-scrape` | `{ urls, … }` | Bulk scrape (optional) |
| `GET /health` | | Health check |
| `GET /stats` | | Usage statistics (optional) |
| `WS /session?mode=…&apiKey=…` | | Persistent browser session (optional) |

Authentication, when enabled, is the `x-api-key` header (and the `apiKey`
query parameter for the WebSocket). Build the service on
`@monostate/node-scraper` (`BNCASmartScraper.scrape()`, `createSession()`),
which provides the engines, outcomes and sessions; the service only adds
HTTP, auth and limits of your choosing.

## API Reference

### Client options

```javascript
const client = new BrowserNativeClient({
  baseUrl: 'http://localhost:3001', // required
  apiKey: '…',                      // optional
  timeout: 30000,                   // request timeout (ms)
  retries: 2,                       // retry attempts
  verbose: false,                   // debug logging
});
```

### Methods

| Method | Description |
|--------|-------------|
| `scrape(url, opts?)` | Extract structured content |
| `screenshot(url, opts?)` | Screenshot with content extraction |
| `quickshot(url, opts?)` | Fast screenshot only |
| `analyze(url, question, opts?)` | AI-powered Q&A |
| `bulkScrape(urls, opts?)` | Scrape multiple URLs concurrently |
| `getUsage(days?)` | Usage statistics (if your API implements `/stats`) |
| `healthCheck()` | API health status |
| `createSession(opts?)` | Persistent browser session over WebSocket |

### Scrape options

```javascript
{
  method: 'auto',            // 'auto' | 'direct' | 'lightpanda' | 'puppeteer'
  includeScreenshot: false,
  waitForSelector: '.content',
  userAgent: 'Custom Bot',
}
```

### Response shape

```javascript
{
  success: true,            // the request succeeded
  data: {                   // the API's JSON body
    data: { title, content, metadata, ... },
    metadata: { method, contentStatus, httpStatus, finalUrl, performance, ... },
  },
  responseTime: 1234,
  attempt: 1,
}
```

Check `data.metadata.contentStatus` to know whether the content is usable:
node-scraper v3 reports empty bodies, SPA shells and block pages honestly
instead of calling them successes.

### Browser sessions

```javascript
const session = await client.createSession({ mode: 'auto' });

await session.goto('https://example.com');
await session.click('#login');
await session.type('#email', 'user@example.com');
const state = await session.getPageState({ includeScreenshot: true });
session.on('fallback', (e) => console.log(`${e.from} -> ${e.to}: ${e.reason}`));
session.close();
```

Modes: `auto` (LightPanda with Chrome fallback), `headless`, `visual`, `computer-use`.

#### Computer use mode

```javascript
const session = await client.createSession({ mode: 'computer-use', screenWidth: 1280, screenHeight: 800 });
await session.goto('https://example.com');
await session.clickAt(640, 400);
await session.typeText('hello world');
await session.drag(10, 20, 300, 400);
const screenshot = await session.screenshot();
console.log(session.vncUrl);
session.close();
```

## Migrating from 2.x

| 2.x | 3.x |
|---|---|
| `new BrowserNativeClient(apiKey)` used the hosted API | `new BrowserNativeClient({ baseUrl, apiKey? })` against your own API |
| API key required | optional; sent only when set |
| `quickScrape(url, apiKey)` | `quickScrape(url, { baseUrl, apiKey? })` (or `(url, apiKey, { baseUrl })`) |
| `method` in results: `'direct' \| 'lightpanda' \| 'puppeteer'` | also `'direct-fetch'`, `'pdf'`, `'failed'`; plus `contentStatus`, `httpStatus`, `finalUrl` |

## TypeScript

Full type definitions included.

```typescript
import { BrowserNativeClient, ScrapeResult, ClientOptions } from '@monostate/browsernative-client';
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT
