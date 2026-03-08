# @monostate/browsernative-client

> JavaScript/TypeScript client for the Browser Native web scraping API

[![npm](https://img.shields.io/npm/v/@monostate/browsernative-client.svg)](https://www.npmjs.com/package/@monostate/browsernative-client)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/monostate/browsernative-client/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Zero-dependency client for scraping, screenshots, and AI analysis. Works in Node.js, browsers, and edge environments.

## Install

```bash
npm install @monostate/browsernative-client
```

Get an API key at [bnca.monostate.ai](https://bnca.monostate.ai).

## Usage

```javascript
import { BrowserNativeClient } from '@monostate/browsernative-client';

const client = new BrowserNativeClient('your-api-key');

// Scrape
const result = await client.scrape('https://example.com');

// Force a specific scraping method
const result = await client.scrape('https://example.com', { method: 'lightpanda' });

// Screenshot
const screenshot = await client.screenshot('https://example.com');

// Quick screenshot (faster, no content extraction)
const quick = await client.quickshot('https://example.com');

// AI Q&A
const analysis = await client.analyze('https://example.com', 'What is this site about?');
```

### Convenience functions

```javascript
import { quickScrape, quickScreenshot, quickShot, quickAnalyze, bulkScrape } from '@monostate/browsernative-client';

const content = await quickScrape('https://example.com', 'your-api-key');
const shot = await quickShot('https://example.com', 'your-api-key');
const answer = await quickAnalyze('https://example.com', 'What is this?', 'your-api-key');
```

### Bulk scraping

```javascript
const urls = ['https://site1.com', 'https://site2.com', 'https://site3.com'];

const { results, stats } = await client.bulkScrape(urls, {
  concurrency: 5,
  continueOnError: true,
  progressCallback: (p) => console.log(`${p.percentage.toFixed(1)}%`),
});

console.log(`${stats.successful}/${stats.total} succeeded in ${stats.totalTime}ms`);
```

## API Reference

### Client options

```javascript
const client = new BrowserNativeClient(apiKey, {
  baseUrl: 'https://bnca-api.fly.dev', // API endpoint
  timeout: 30000,                       // Request timeout (ms)
  retries: 2,                           // Retry attempts
  verbose: false,                       // Debug logging
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
| `getUsage(days?)` | Account usage statistics |
| `healthCheck()` | API health status |

### Scrape options

```javascript
{
  method: 'auto',            // 'auto' | 'direct' | 'lightpanda' | 'puppeteer'
  includeScreenshot: false,
  waitForSelector: '.content',
  userAgent: 'Custom Bot',
  viewport: { width: 1920, height: 1080 },
  extractMetadata: true,
}
```

### Response shape

```javascript
{
  success: true,
  data: { title, content, metadata, ... },
  responseTime: 1234,
  attempt: 1,
}
```

## TypeScript

Full type definitions included.

```typescript
import { BrowserNativeClient, ScrapeResult, BulkScrapeResult } from '@monostate/browsernative-client';
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT
