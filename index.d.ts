/**
 * Browser Native Client SDK TypeScript Definitions
 */

export interface ClientOptions {
  /** Base URL for the API (default: https://bnca-api.fly.dev) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts (default: 2) */
  retries?: number;
  /** Enable verbose logging (default: false) */
  verbose?: boolean;
}

export interface ScrapeOptions {
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
  method?: 'direct' | 'lightpanda' | 'puppeteer';
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

export interface AnalyzeResult extends ScrapeResult {
  /** AI analysis response */
  analysis?: {
    answer: string;
    confidence: number;
    processingTime: number;
    language: string;
  };
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

/**
 * Browser Native API Client
 */
export declare class BrowserNativeClient {
  constructor(apiKey: string, options?: ClientOptions);

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
   * Get account usage statistics
   */
  getUsage(days?: number): Promise<UsageResult>;

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
  apiKey: string, 
  options?: ScrapeOptions
): Promise<ScrapeResult>;

/**
 * Convenience function for taking screenshots
 */
export declare function quickScreenshot(
  url: string, 
  apiKey: string, 
  options?: ScreenshotOptions
): Promise<ScrapeResult>;

/**
 * Convenience function for AI analysis
 */
export declare function quickAnalyze(
  url: string, 
  question: string, 
  apiKey: string, 
  options?: AnalyzeOptions
): Promise<AnalyzeResult>;

/**
 * Convenience function for quick screenshot capture
 */
export declare function quickShot(
  url: string, 
  apiKey: string, 
  options?: ScreenshotOptions
): Promise<ScrapeResult>;

export default BrowserNativeClient;