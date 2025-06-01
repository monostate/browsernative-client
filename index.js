/**
 * Browser Native Client SDK
 * 
 * A lightweight JavaScript client for the Browser Native web scraping API.
 * Works in browsers, Node.js, and edge environments.
 */

export class BrowserNativeClient {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('API key is required. Get one at https://bnca.monostate.ai');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://bnca-api.fly.dev';
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
   * Get account usage statistics
   * @param {number} days - Number of days to fetch (max 30)
   * @returns {Promise<object>} Usage statistics
   */
  async getUsage(days = 30) {
    return this._makeRequest('/stats', {}, 'GET');
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
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'User-Agent': 'Browser Native Client SDK/1.2.1'
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
 * @param {string} apiKey - Your API key
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
 * @param {string} apiKey - Your API key
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
 * @param {string} apiKey - Your API key
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
 * @param {string} apiKey - Your API key
 * @param {object} options - Additional options
 * @returns {Promise<object>} Screenshot result
 */
export async function quickShot(url, apiKey, options = {}) {
  const client = new BrowserNativeClient(apiKey, options);
  return client.quickshot(url, options);
}

// Default export for CommonJS compatibility
export default BrowserNativeClient;