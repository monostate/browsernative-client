/**
 * Browser Native Client SDK TypeScript Definitions
 */

export interface ClientOptions {
  /** Base URL of your self-hosted node-scraper API, e.g. "http://localhost:3001" (required) */
  baseUrl: string;
  /** API key sent as x-api-key, if your deployment requires one */
  apiKey?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts (default: 2) */
  retries?: number;
  /** Enable verbose logging (default: false) */
  verbose?: boolean;
}

export interface ScrapeOptions {
  /** Force a specific scraping method */
  method?: 'auto' | 'direct' | 'lightpanda' | 'puppeteer';
  /** Include screenshot in the response */
  includeScreenshot?: boolean;
  /** Wait for specific selector before extracting content */
  waitForSelector?: string;
  /** Custom user agent string */
  userAgent?: string;
  /** Viewport size for rendering */
  viewport?: {
    width: number;
    height: number;
  };
  /** Additional metadata to extract */
  extractMetadata?: boolean;
}

export interface BulkScrapeOptions extends ScrapeOptions {
  /** Number of concurrent requests (default: 5) */
  concurrency?: number;
  /** Continue on error (default: true) */
  continueOnError?: boolean;
  /** Progress callback */
  progressCallback?: (progress: { processed: number; total: number; percentage: number }) => void;
}

export interface BulkScrapeResult {
  results: Array<ScrapeResult & { url: string }>;
  stats: {
    total: number;
    successful: number;
    failed: number;
    totalTime: number;
    averageTime: number;
  };
}

export interface ScreenshotOptions extends ScrapeOptions {
  /** Force full page screenshot */
  fullPage?: boolean;
  /** Image format (default: png) */
  format?: 'png' | 'jpeg' | 'webp';
  /** Image quality for JPEG (1-100) */
  quality?: number;
}

export interface AnalyzeOptions extends ScrapeOptions {
  /** Language for the AI response */
  language?: 'en' | 'pt' | 'es' | 'fr' | 'de' | 'auto';
  /** Response style */
  style?: 'concise' | 'detailed' | 'technical';
}

export interface ScrapeResult {
  /** Whether the request was successful */
  success: boolean;
  /** Extracted content data */
  data?: {
    title?: string;
    description?: string;
    content?: string;
    metadata?: Record<string, any>;
    links?: string[];
    images?: string[];
  };
  /** Scraping method used */
  method?: 'direct' | 'direct-fetch' | 'lightpanda' | 'puppeteer' | 'pdf' | 'failed' | 'error';
  /**
   * Content outcome reported by the API (node-scraper v3+): whether the
   * extracted content is usable, or why not. Optional for older servers.
   */
  contentStatus?: 'usable' | 'browser_required_shell' | 'blocked' | 'empty' | 'navigation_error' | 'unsupported' | 'rejected_by_caller';
  /** HTTP status of the final response (node-scraper v3+) */
  httpStatus?: number | null;
  /** URL after redirects (node-scraper v3+) */
  finalUrl?: string;
  /** Performance information */
  performance?: {
    totalTime: number;
    method: string;
  };
  /** Base64 encoded screenshot (if requested) */
  screenshot?: string;
  /** Error message (if failed) */
  error?: string;
  /** Response time in milliseconds */
  responseTime: number;
  /** Attempt number that succeeded */
  attempt?: number;
}

export interface AnalyzeResult {
  /** Whether the request was successful */
  success: boolean;
  /** API response data */
  data?: {
    /** Whether the inner request was successful */
    success?: boolean;
    /** The answer from AI analysis */
    answer?: string;
    /** Metadata about the request */
    metadata?: {
      url: string;
      question: string;
      method: string;
      timestamp: string;
      performance: {
        totalTime: number;
      };
      screenshot?: string | null;
    };
  };
  /** Error message (if failed) */
  error?: string;
  /** Response time in milliseconds */
  responseTime: number;
  /** Attempt number that succeeded */
  attempt?: number;
}

export interface UsageResult {
  success: boolean;
  data?: {
    /** Daily usage breakdown */
    dailyUsage: Array<{
      date: string;
      requests: number;
      scrapeRequests: number;
      analyzeRequests: number;
    }>;
    /** Monthly totals */
    monthlyTotal: {
      totalRequests: number;
      scrapeTotal: number;
      analyzeTotal: number;
    };
    /** Current plan information */
    currentUsage: number;
    usageLimit: number;
    planType: string;
    subscriptionStatus: string;
    currentPeriodEnd: string;
  };
  error?: string;
  responseTime: number;
}

export interface HealthResult {
  success: boolean;
  data?: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    services: {
      scraping: boolean;
      ai: boolean;
      database: boolean;
    };
  };
  error?: string;
  responseTime: number;
}

export interface SessionOptions {
  /** Browser mode (default: 'auto') */
  mode?: 'auto' | 'headless' | 'visual' | 'computer-use';
  /** Screen width for computer-use mode */
  screenWidth?: number;
  /** Screen height for computer-use mode */
  screenHeight?: number;
}

export interface PageState {
  url: string;
  title: string;
  content?: string;
  screenshot?: string;
  interactiveElements?: Array<{
    tag: string;
    text?: string;
    selector: string;
    type?: string;
    href?: string;
  }>;
}

export interface FallbackEvent {
  type: 'fallback';
  from: string;
  to: string;
  reason: string;
}

export interface ClosedEvent {
  type: 'closed';
  reason: string;
}

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Persistent browser session over WebSocket
 */
export declare class BrowserSession {
  /** Session ID assigned by the server */
  sessionId: string | null;
  /** Current browser backend ('lightpanda', 'chrome', or 'computer-use') */
  backend: string | null;
  /** VNC URL for computer-use mode (null otherwise) */
  vncUrl: string | null;

  /** Navigate to a URL */
  goto(url: string): Promise<any>;
  /** Click an element */
  click(selector: string, options?: { timeout?: number }): Promise<any>;
  /** Type text into an element */
  type(selector: string, text: string, options?: { clear?: boolean; delay?: number }): Promise<any>;
  /** Scroll the page */
  scroll(direction?: 'up' | 'down', amount?: number): Promise<any>;
  /** Hover over an element */
  hover(selector: string): Promise<any>;
  /** Select option(s) in a dropdown */
  select(selector: string, ...values: string[]): Promise<any>;
  /** Press a keyboard key */
  pressKey(key: string): Promise<any>;
  /** Navigate back */
  goBack(): Promise<any>;
  /** Navigate forward */
  goForward(): Promise<any>;
  /** Take a screenshot */
  screenshot(options?: { fullPage?: boolean; type?: 'png' | 'jpeg' | 'webp'; quality?: number }): Promise<any>;
  /** Get current page state with interactive elements */
  getPageState(options?: { includeScreenshot?: boolean }): Promise<PageState>;
  /** Extract page content as structured data */
  extractContent(): Promise<any>;
  /** Wait for a selector to appear */
  waitFor(selector: string, timeout?: number): Promise<any>;
  /** Evaluate JavaScript in the page context */
  evaluate(fn: string): Promise<any>;
  /** Get all cookies */
  getCookies(): Promise<Cookie[]>;
  /** Set cookies */
  setCookies(cookies: Cookie[]): Promise<any>;

  /** Coordinate-based actions (computer-use mode) */
  mouseMove(x: number, y: number): Promise<any>;
  clickAt(x: number, y: number, button?: 'left' | 'right' | 'middle'): Promise<any>;
  doubleClickAt(x: number, y: number, button?: 'left' | 'right' | 'middle'): Promise<any>;
  drag(startX: number, startY: number, endX: number, endY: number): Promise<any>;
  scrollAt(x: number, y: number, direction: 'up' | 'down', amount?: number): Promise<any>;
  typeText(text: string): Promise<any>;
  getCursorPosition(): Promise<{ x: number; y: number }>;
  getScreenSize(): Promise<{ width: number; height: number }>;

  /** Listen for session events */
  on(event: 'fallback', handler: (event: FallbackEvent) => void): this;
  on(event: 'closed', handler: (event: ClosedEvent) => void): this;

  /** Close the session */
  close(): void;
}

/**
 * Browser Native API Client
 */
export declare class BrowserNativeClient {
  constructor(options: ClientOptions);
  constructor(apiKey: string | null | undefined, options: ClientOptions);
  /** null when the deployment needs no key */
  readonly apiKey: string | null;
  readonly baseUrl: string;

  /**
   * Scrape a webpage and extract structured content
   */
  scrape(url: string, options?: ScrapeOptions): Promise<ScrapeResult>;

  /**
   * Scrape a webpage and take a screenshot
   */
  screenshot(url: string, options?: ScreenshotOptions): Promise<ScrapeResult>;

  /**
   * Quick screenshot capture - optimized for speed
   */
  quickshot(url: string, options?: ScreenshotOptions): Promise<ScrapeResult>;

  /**
   * Extract content and answer questions using AI
   */
  analyze(url: string, question: string, options?: AnalyzeOptions): Promise<AnalyzeResult>;

  /**
   * Scrape multiple URLs with concurrency control
   */
  bulkScrape(urls: string[], options?: BulkScrapeOptions): Promise<BulkScrapeResult>;

  /**
   * Get account usage statistics
   */
  getUsage(days?: number): Promise<UsageResult>;

  /**
   * Create a persistent browser session via WebSocket
   */
  createSession(options?: SessionOptions): Promise<BrowserSession>;

  /**
   * Check API health and your account status
   */
  healthCheck(): Promise<HealthResult>;
}

/**
 * Convenience function for quick scraping without instantiating a client
 */
export declare function quickScrape(
  url: string, 
  apiKey: string | ClientOptions, 
  options?: ScrapeOptions
): Promise<ScrapeResult>;

/**
 * Convenience function for taking screenshots
 */
export declare function quickScreenshot(
  url: string, 
  apiKey: string | ClientOptions, 
  options?: ScreenshotOptions
): Promise<ScrapeResult>;

/**
 * Convenience function for AI analysis
 */
export declare function quickAnalyze(
  url: string, 
  question: string, 
  apiKey: string | ClientOptions, 
  options?: AnalyzeOptions
): Promise<AnalyzeResult>;

/**
 * Convenience function for quick screenshot capture
 */
export declare function quickShot(
  url: string, 
  apiKey: string | ClientOptions, 
  options?: ScreenshotOptions
): Promise<ScrapeResult>;

/**
 * Convenience function for bulk scraping multiple URLs
 */
export declare function bulkScrape(
  urls: string[],
  apiKey: string | ClientOptions,
  options?: BulkScrapeOptions
): Promise<BulkScrapeResult>;

export default BrowserNativeClient;