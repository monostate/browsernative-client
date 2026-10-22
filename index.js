/**
 * Browser Native Client SDK
 *
 * A lightweight JavaScript client for a self-hosted node-scraper API
 * (the HTTP/WebSocket service built on @monostate/node-scraper).
 * Works in browsers, Node.js, and edge environments.
 *
 * There is no hosted default: you run the API and point the client at it.
 */

// Keep in sync with package.json "version"; test/client.test.mjs fails the suite when they drift.
// (A constant, not a package.json read: this module also runs in browsers and edge runtimes.)
const SDK_VERSION = '3.1.0';
const USER_AGENT = `Browser Native Client SDK/${SDK_VERSION}`;

export class BrowserNativeClient {
  /**
   * @param {string|{ baseUrl: string, apiKey?: string, timeout?: number, retries?: number, verbose?: boolean }} [apiKeyOrOptions]
   *   Either the API key (string) followed by options, or a single options object.
   * @param {{ baseUrl: string, apiKey?: string, timeout?: number, retries?: number, verbose?: boolean }} [options]
   */
  constructor(apiKeyOrOptions, options = {}) {
    let apiKey = apiKeyOrOptions;
    if (apiKeyOrOptions && typeof apiKeyOrOptions === 'object') {
      options = apiKeyOrOptions;
      apiKey = options.apiKey;
    }
    if (!options || !options.baseUrl) {
      throw new Error(
        'baseUrl is required. The hosted Browser Native API has been retired: ' +
        'run your own node-scraper API and point the client at it, e.g. ' +
        "new BrowserNativeClient({ baseUrl: 'http://localhost:3001', apiKey: '...' })"
      );
    }

    this.apiKey = apiKey || null;
    this.baseUrl = String(options.baseUrl).replace(/\/+$/, '');
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 2;
    this.verbose = options.verbose || false;
  }

  /**
   * Scrape a webpage and extract structured content
   * @param {string} url - The URL to scrape
   * @param {object} options - Scraping options
   * @returns {Promise<object>} Scraping result
   */
  async scrape(url, options = {}) {
    const payload = {
      url,
      screenshot: options.includeScreenshot || false,
      ...options
    };

    return this._makeRequest('/scrapeurl', payload);
  }

  /**
   * Scrape a webpage and take a screenshot
   * @param {string} url - The URL to scrape
   * @param {object} options - Screenshot options
   * @returns {Promise<object>} Screenshot result with base64 image
   */
  async screenshot(url, options = {}) {
    const payload = {
      url,
      screenshot: true,
      ...options
    };

    return this._makeRequest('/scrapeurl', payload);
  }

  /**
   * Quick screenshot capture - optimized for speed
   * @param {string} url - The URL to capture
   * @param {object} options - Screenshot options
   * @returns {Promise<object>} Screenshot result
   */
  async quickshot(url, options = {}) {
    const payload = {
      url,
      ...options
    };

    return this._makeRequest('/quickshot', payload);
  }

  /**
   * Extract content and answer questions using AI
   * @param {string} url - The URL to analyze
   * @param {string} question - The question to answer
   * @param {object} options - Analysis options
   * @returns {Promise<object>} AI analysis result
   */
  async analyze(url, question, options = {}) {
    const payload = {
      url,
      question,
      screenshot: options.includeScreenshot || false,
      ...options
    };

    return this._makeRequest('/aireply', payload);
  }

  /**
   * Scrape multiple URLs with concurrency control
   * @param {string[]} urls - URLs to scrape
   * @param {object} options - Bulk scraping options
   * @returns {Promise<object>} Aggregated results
   */
  async bulkScrape(urls, options = {}) {
    const concurrency = options.concurrency || 5;
    const continueOnError = options.continueOnError !== false;
    const results = [];
    const startTime = Date.now();
    let processed = 0;

    const queue = [...urls];
    const workers = Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
      while (queue.length > 0) {
        const url = queue.shift();
        if (!url) break;
        try {
          const result = await this.scrape(url, options);
          results.push({ url, ...result });
        } catch (error) {
          results.push({ url, success: false, error: error.message });
          if (!continueOnError) throw error;
        }
        processed++;
        if (options.progressCallback) {
          options.progressCallback({
            processed,
            total: urls.length,
            percentage: (processed / urls.length) * 100,
          });
        }
      }
    });

    await Promise.all(workers);

    const successful = results.filter(r => r.success).length;
    return {
      results,
      stats: {
        total: urls.length,
        successful,
        failed: urls.length - successful,
        totalTime: Date.now() - startTime,
        averageTime: Math.round((Date.now() - startTime) / urls.length),
      },
    };
  }

  /**
   * Usage statistics (GET /stats) — only if your API implements it
   * @param {number} days - Number of days to fetch (max 30)
   * @returns {Promise<object>} Usage statistics
   */
  async getUsage(days = 30) {
    return this._makeRequest('/stats', {}, 'GET');
  }

  /**
   * Create a persistent browser session via WebSocket
   * @param {object} options - Session options
   * @param {'auto'|'headless'|'visual'|'computer-use'} options.mode - Browser mode (default: 'auto')
   * @param {number} [options.screenWidth] - Screen width for computer-use mode
   * @param {number} [options.screenHeight] - Screen height for computer-use mode
   * @returns {Promise<BrowserSession>} Connected browser session
   */
  async createSession(options = {}) {
    const wsUrl = this.baseUrl.replace(/^http/, 'ws');
    const mode = options.mode || 'auto';
    const params = new URLSearchParams({ mode });
    if (this.apiKey) params.set('apiKey', this.apiKey);
    if (options.screenWidth) params.set('screenWidth', String(options.screenWidth));
    if (options.screenHeight) params.set('screenHeight', String(options.screenHeight));
    const url = `${wsUrl}/session?${params}`;

    const session = new BrowserSession(url, { verbose: this.verbose });
    await session.connect();
    return session;
  }

  /**
   * Check API health and your account status
   * @returns {Promise<object>} Health check result
   */
  async healthCheck() {
    return this._makeRequest('/health', {}, 'GET');
  }

  /**
   * Make an authenticated request to the API
   * @private
   */
  async _makeRequest(endpoint, payload = {}, method = 'POST', queryParams = '') {
    const url = `${this.baseUrl}${endpoint}${queryParams}`;
    const startTime = Date.now();

    let lastError;
    
    for (let attempt = 1; attempt <= this.retries + 1; attempt++) {
      try {
        if (this.verbose) {
          console.log(`Browser Native: ${method} ${url} (attempt ${attempt})`);
        }

        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': USER_AGENT,
            ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
          }
        };

        if (method !== 'GET') {
          options.body = JSON.stringify(payload);
        }

        // Set up timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        options.signal = controller.signal;

        const response = await fetch(url, options);
        clearTimeout(timeoutId);

        const responseTime = Date.now() - startTime;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        
        if (this.verbose) {
          console.log(`Browser Native: Request completed in ${responseTime}ms`);
        }

        return {
          success: true,
          data,
          responseTime,
          attempt
        };

      } catch (error) {
        lastError = error;
        
        if (attempt <= this.retries && !error.name === 'AbortError') {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          if (this.verbose) {
            console.log(`Browser Native: Attempt ${attempt} failed, retrying in ${delay}ms...`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        break;
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError.message || 'Request failed',
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Convenience function for quick scraping without instantiating a client
 * @param {string} url - The URL to scrape
 * @param {string|object} apiKey - Your API key, or an options object with baseUrl (and optional apiKey)
 * @param {object} options - Additional options
 * @returns {Promise<object>} Scraping result
 */
export async function quickScrape(url, apiKey, options = {}) {
  const client = new BrowserNativeClient(apiKey, options);
  return client.scrape(url, options);
}

/**
 * Convenience function for taking screenshots
 * @param {string} url - The URL to capture
 * @param {string|object} apiKey - Your API key, or an options object with baseUrl (and optional apiKey)
 * @param {object} options - Additional options
 * @returns {Promise<object>} Screenshot result
 */
export async function quickScreenshot(url, apiKey, options = {}) {
  const client = new BrowserNativeClient(apiKey, options);
  return client.screenshot(url, options);
}

/**
 * Convenience function for AI analysis
 * @param {string} url - The URL to analyze
 * @param {string} question - The question to answer
 * @param {string|object} apiKey - Your API key, or an options object with baseUrl (and optional apiKey)
 * @param {object} options - Additional options
 * @returns {Promise<object>} Analysis result
 */
export async function quickAnalyze(url, question, apiKey, options = {}) {
  const client = new BrowserNativeClient(apiKey, options);
  return client.analyze(url, question, options);
}

/**
 * Convenience function for quick screenshot capture
 * @param {string} url - The URL to capture
 * @param {string|object} apiKey - Your API key, or an options object with baseUrl (and optional apiKey)
 * @param {object} options - Additional options
 * @returns {Promise<object>} Screenshot result
 */
export async function quickShot(url, apiKey, options = {}) {
  const client = new BrowserNativeClient(apiKey, options);
  return client.quickshot(url, options);
}

/**
 * Convenience function for bulk scraping multiple URLs
 * @param {string[]} urls - URLs to scrape
 * @param {string|object} apiKey - Your API key, or an options object with baseUrl (and optional apiKey)
 * @param {object} options - Bulk options (concurrency, continueOnError, progressCallback)
 * @returns {Promise<object>} Aggregated results
 */
export async function bulkScrape(urls, apiKey, options = {}) {
  const client = new BrowserNativeClient(apiKey, options);
  return client.bulkScrape(urls, options);
}

// ── Browser Session (WebSocket) ──────────────────────────────────────────────

class BrowserSession {
  constructor(url, options = {}) {
    this._url = url;
    this._ws = null;
    this._nextId = 1;
    this._pending = new Map(); // id → { resolve, reject }
    this._verbose = options.verbose || false;
    this._eventHandlers = {};
    this.sessionId = null;
    this.backend = null;
    this.vncUrl = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const WebSocketImpl = typeof WebSocket !== 'undefined'
        ? WebSocket
        : null;

      if (!WebSocketImpl) {
        // Node.js — try dynamic import
        import('ws').then(ws => {
          this._ws = new ws.default(this._url);
          this._wireEvents(resolve, reject);
        }).catch(() => {
          reject(new Error('WebSocket not available. Install "ws" package for Node.js: npm install ws'));
        });
        return;
      }

      this._ws = new WebSocketImpl(this._url);
      this._wireEvents(resolve, reject);
    });
  }

  _wireEvents(onConnected, onError) {
    this._ws.onmessage = (event) => {
      const data = typeof event.data === 'string' ? event.data : event.data.toString();
      let msg;
      try { msg = JSON.parse(data); } catch { return; }

      if (msg.type === 'connected') {
        this.sessionId = msg.sessionId;
        this.backend = msg.backend;
        this.vncUrl = msg.vncUrl || null;
        if (this._verbose) console.log(`Browser Native: Session ${msg.sessionId} connected (${msg.backend})`);
        onConnected(this);
        return;
      }

      if (msg.type === 'fallback') {
        this.backend = msg.to;
        if (this._verbose) console.log(`Browser Native: Fallback ${msg.from} → ${msg.to} (${msg.reason})`);
        if (this._eventHandlers.fallback) this._eventHandlers.fallback(msg);
        return;
      }

      if (msg.type === 'closed') {
        if (this._verbose) console.log(`Browser Native: Session closed (${msg.reason})`);
        if (this._eventHandlers.closed) this._eventHandlers.closed(msg);
        return;
      }

      // Match response to pending request by id
      if (msg.id != null && this._pending.has(msg.id)) {
        const { resolve, reject } = this._pending.get(msg.id);
        this._pending.delete(msg.id);
        if (msg.type === 'error') {
          reject(new Error(msg.message));
        } else {
          if (msg.backend) this.backend = msg.backend;
          resolve(msg.data);
        }
      }
    };

    this._ws.onerror = (err) => {
      onError(new Error(err.message || 'WebSocket connection failed'));
    };

    this._ws.onclose = (event) => {
      // Reject all pending requests
      for (const [, { reject }] of this._pending) {
        reject(new Error(`Session closed: ${event.reason || 'unknown'}`));
      }
      this._pending.clear();
    };
  }

  _send(action, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this._ws || this._ws.readyState !== 1) {
        return reject(new Error('Session not connected'));
      }
      const id = this._nextId++;
      this._pending.set(id, { resolve, reject });
      this._ws.send(JSON.stringify({ id, action, ...params }));
    });
  }

  on(event, handler) {
    this._eventHandlers[event] = handler;
    return this;
  }

  async goto(url) { return this._send('goto', { url }); }
  async click(selector, options = {}) { return this._send('click', { selector, ...options }); }
  async type(selector, text, options = {}) { return this._send('type', { selector, text, ...options }); }
  async scroll(direction = 'down', amount = 500) { return this._send('scroll', { direction, amount }); }
  async hover(selector) { return this._send('hover', { selector }); }
  async select(selector, ...values) { return this._send('select', { selector, values }); }
  async pressKey(key) { return this._send('pressKey', { key }); }
  async goBack() { return this._send('goBack'); }
  async goForward() { return this._send('goForward'); }
  async screenshot(options = {}) { return this._send('screenshot', options); }
  async getPageState(options = {}) { return this._send('getPageState', options); }
  async extractContent() { return this._send('extractContent'); }
  async waitFor(selector, timeout) { return this._send('waitFor', { selector, timeout }); }
  async evaluate(fn) { return this._send('evaluate', { fn }); }
  async getCookies() { return this._send('getCookies'); }
  async setCookies(cookies) { return this._send('setCookies', { cookies }); }

  // Coordinate-based actions (computer-use mode)
  async mouseMove(x, y) { return this._send('mouseMove', { x, y }); }
  async clickAt(x, y, button = 'left') { return this._send('clickAt', { x, y, button }); }
  async doubleClickAt(x, y, button = 'left') { return this._send('doubleClickAt', { x, y, button }); }
  async drag(startX, startY, endX, endY) { return this._send('drag', { startX, startY, endX, endY }); }
  async scrollAt(x, y, direction, amount) { return this._send('scrollAt', { x, y, direction, amount }); }
  async typeText(text) { return this._send('typeText', { text }); }
  async getCursorPosition() { return this._send('getCursorPosition'); }
  async getScreenSize() { return this._send('getScreenSize'); }

  close() {
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }
}

export { BrowserSession };

// Default export for CommonJS compatibility
export default BrowserNativeClient;