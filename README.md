# @browsernative/client

> **Official JavaScript/TypeScript client for Browser Native API**

[![npm version](https://badge.fury.io/js/%40browsernative%2Fclient.svg)](https://badge.fury.io/js/%40browsernative%2Fclient)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

A lightweight, fast, and reliable client for the Browser Native web scraping and content extraction API. Works in browsers, Node.js, Deno, and edge environments.

## 🚀 Quick Start

### Installation

```bash
npm install @browsernative/client
# or
yarn add @browsernative/client
# or  
pnpm add @browsernative/client
```

### Get Your API Key

1. Sign up at [bnca.monostate.ai](https://bnca.monostate.ai)
2. Get your API key from the dashboard
3. Start scraping!

### Basic Usage

```javascript
import { BrowserNativeClient } from '@browsernative/client';

const client = new BrowserNativeClient('your-api-key');

// Scrape any website
const result = await client.scrape('https://example.com');
console.log(result.data.title);
console.log(result.data.content);

// Quick screenshot capture (optimized for speed)
const screenshot = await client.quickshot('https://example.com');
console.log(screenshot.screenshot); // Base64 image
```

### Quick Functions

```javascript
import { quickScrape, quickScreenshot, quickShot, quickAnalyze } from '@browsernative/client';

// One-line scraping
const content = await quickScrape('https://example.com', 'your-api-key');

// Take a screenshot (with content extraction)
const screenshot = await quickScreenshot('https://example.com', 'your-api-key');

// Quick screenshot only (fastest option)
const quickScreenshot = await quickShot('https://example.com', 'your-api-key');

// AI-powered analysis
const analysis = await quickAnalyze(
  'https://news.ycombinator.com', 
  'What are the top 3 trending topics?',
  'your-api-key'
);
```

## 📋 API Reference

### Client Initialization

```javascript
const client = new BrowserNativeClient(apiKey, options);
```

**Options:**
- `baseUrl` (string): API base URL (default: `https://bnca-api.fly.dev`)
- `timeout` (number): Request timeout in ms (default: `30000`)
- `retries` (number): Number of retry attempts (default: `2`)
- `verbose` (boolean): Enable logging (default: `false`)

### Methods

#### `client.scrape(url, options)`

Extract structured content from any webpage.

```javascript
const result = await client.scrape('https://example.com', {
  includeScreenshot: true,
  waitForSelector: '.main-content',
  extractMetadata: true,
  userAgent: 'Custom Bot 1.0'
});

console.log(result.data.title);      // Page title
console.log(result.data.content);   // Main content
console.log(result.data.metadata);  // Meta tags, etc.
console.log(result.screenshot);     // Base64 image (if requested)
console.log(result.method);         // Scraping method used
```

**Options:**
- `includeScreenshot` (boolean): Include page screenshot
- `waitForSelector` (string): CSS selector to wait for
- `userAgent` (string): Custom user agent
- `viewport` (object): `{ width: number, height: number }`
- `extractMetadata` (boolean): Extract meta tags and structured data

#### `client.screenshot(url, options)`

Take high-quality screenshots of webpages with content extraction.

```javascript
const result = await client.screenshot('https://example.com', {
  fullPage: true,
  format: 'png',
  viewport: { width: 1920, height: 1080 }
});

// Use the base64 image
const img = `data:image/png;base64,${result.screenshot}`;
```

**Options:**
- `fullPage` (boolean): Capture full page scroll
- `format` (string): `'png'`, `'jpeg'`, or `'webp'`
- `quality` (number): JPEG quality (1-100)
- All scrape options are also available

#### `client.quickshot(url, options)`

Optimized screenshot capture for maximum speed (no content extraction).

```javascript
const result = await client.quickshot('https://example.com');

// Returns screenshot immediately
if (result.success && result.screenshot) {
  const img = result.screenshot; // Already includes data:image/png;base64,
}
```

**Benefits:**
- 2-3x faster than regular screenshot
- Optimized for visual capture only
- Perfect for thumbnails and previews

#### `client.analyze(url, question, options)`

AI-powered content analysis and question answering.

```javascript
const result = await client.analyze(
  'https://techcrunch.com',
  'What are the latest AI developments mentioned?',
  {
    language: 'en',
    style: 'detailed'
  }
);

console.log(result.analysis.answer);     // AI response
console.log(result.analysis.confidence); // Confidence score
```

**Options:**
- `language` (string): Response language (`'en'`, `'pt'`, `'es'`, `'fr'`, `'de'`, `'auto'`)
- `style` (string): Response style (`'concise'`, `'detailed'`, `'technical'`)
- All scrape options are also available

#### `client.getUsage(days)`

Get your account usage statistics.

```javascript
const usage = await client.getUsage(30); // Last 30 days

console.log(usage.data.monthlyTotal.totalRequests);
console.log(usage.data.currentUsage);
console.log(usage.data.usageLimit);
```

#### `client.healthCheck()`

Check API status and your account health.

```javascript
const health = await client.healthCheck();

console.log(health.data.status);   // 'healthy', 'degraded', or 'unhealthy'
console.log(health.data.services); // Service status breakdown
```

## 🌐 Framework Integration

### React Hook

```javascript
// hooks/useBrowserNative.js
import { useState } from 'react';
import { BrowserNativeClient } from '@browsernative/client';

export function useBrowserNative(apiKey) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const client = new BrowserNativeClient(apiKey);

  const scrape = async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.scrape(url, options);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { scrape, loading, data, error };
}
```

### Vue Composable

```javascript
// composables/useBrowserNative.js
import { ref } from 'vue';
import { BrowserNativeClient } from '@browsernative/client';

export function useBrowserNative(apiKey) {
  const loading = ref(false);
  const data = ref(null);
  const error = ref(null);

  const client = new BrowserNativeClient(apiKey);

  const scrape = async (url, options = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await client.scrape(url, options);
      if (result.success) {
        data.value = result.data;
      } else {
        error.value = result.error;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return { scrape, loading, data, error };
}
```

### Next.js API Route

```javascript
// pages/api/scrape.js
import { BrowserNativeClient } from '@browsernative/client';

const client = new BrowserNativeClient(process.env.BROWSER_NATIVE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, question } = req.body;
    
    let result;
    if (question) {
      result = await client.analyze(url, question);
    } else {
      result = await client.scrape(url);
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Express.js

```javascript
import express from 'express';
import { BrowserNativeClient } from '@browsernative/client';

const app = express();
const client = new BrowserNativeClient(process.env.BROWSER_NATIVE_API_KEY);

app.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    const result = await client.scrape(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🔒 Environment Variables

Create a `.env` file:

```bash
BROWSER_NATIVE_API_KEY=your_api_key_here
```

Then use in your code:

```javascript
const client = new BrowserNativeClient(process.env.BROWSER_NATIVE_API_KEY);
```

## 📱 Browser Usage

You can use this client directly in browsers, but be careful with API keys:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Browser Native Demo</title>
</head>
<body>
    <script type="module">
        import { BrowserNativeClient } from 'https://cdn.skypack.dev/@browsernative/client';
        
        // ⚠️ Never expose your API key in client-side code!
        // Use a proxy server or environment variables
        const client = new BrowserNativeClient(await getApiKeyFromServer());
        
        const result = await client.scrape('https://example.com');
        console.log(result);
    </script>
</body>
</html>
```

**Security Note**: Never expose your API key in client-side code. Use a backend proxy or server-side rendering.

## ⚡ Performance Tips

1. **Reuse Client Instances**: Create one client instance and reuse it
2. **Enable Retries**: The client automatically retries failed requests
3. **Use Appropriate Timeouts**: Adjust timeout based on your use case
4. **Batch Requests**: Process multiple URLs concurrently

```javascript
const client = new BrowserNativeClient(apiKey, {
  timeout: 45000,  // Longer timeout for complex sites
  retries: 3,      // More retries for reliability
  verbose: true    // Enable logging for debugging
});

// Concurrent scraping
const urls = ['https://site1.com', 'https://site2.com', 'https://site3.com'];
const results = await Promise.all(
  urls.map(url => client.scrape(url))
);
```

## 🔧 Error Handling

```javascript
try {
  const result = await client.scrape(url);
  
  if (result.success) {
    console.log('Success:', result.data);
  } else {
    console.error('Scraping failed:', result.error);
  }
} catch (error) {
  console.error('Request failed:', error.message);
}
```

Common error scenarios:
- **Invalid API Key**: Check your API key and account status
- **Rate Limited**: Upgrade your plan or reduce request frequency
- **Timeout**: Increase timeout or try a simpler extraction method
- **Invalid URL**: Ensure the URL is accessible and properly formatted

## 🚀 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { BrowserNativeClient, ScrapeResult, AnalyzeResult } from '@browsernative/client';

const client: BrowserNativeClient = new BrowserNativeClient('your-api-key');

const result: ScrapeResult = await client.scrape('https://example.com');
const analysis: AnalyzeResult = await client.analyze(url, question);
```

## 📊 Rate Limits

| Plan | Requests/Month | Rate Limit |
|------|----------------|------------|
| **Free** | 1,000 | 10/minute |
| **Starter** | 10,000 | 60/minute |
| **Pro** | 100,000 | 300/minute |
| **Enterprise** | Unlimited | Custom |

## 🤝 Support

- 📧 **Email**: [support@bnca.monostate.ai](mailto:support@bnca.monostate.ai)
- 📖 **Documentation**: [bnca.monostate.ai/docs](https://bnca.monostate.ai/docs)
- 🐛 **Issues**: [GitHub Issues](https://github.com/browsernative/client-sdk/issues)
- 💬 **Discord**: [Join our community](https://discord.gg/browsernative)

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for developers who value speed and reliability**

[🌐 Website](https://bnca.monostate.ai) | [📖 Docs](https://bnca.monostate.ai/docs) | [🚀 Get API Key](https://bnca.monostate.ai/signup)

</div>