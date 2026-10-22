# Changelog

## [Unreleased]

### Changed
- `engines.node` is now `>=22.0.0`. Node 18 and 20 are end-of-life and no longer
  receive security fixes (see the
  [October 2026 Node.js security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)).

## [3.0.0] - 2026-10-20

### Breaking Changes
- **No hosted default.** The Browser Native hosted API (bnca-api.fly.dev / bnca.monostate.ai) has been retired. `baseUrl` is now required and points at a node-scraper API you host.
- **API key is optional.** `new BrowserNativeClient({ baseUrl, apiKey? })` (the 2.x `(apiKey, { baseUrl })` shape still works). `x-api-key` and the WebSocket `apiKey` parameter are only sent when a key is set.
- Convenience functions accept an options object in place of the key: `quickScrape(url, { baseUrl, apiKey? })`.

### Added
- Result types carry node-scraper v3 outcome fields: `contentStatus`, `httpStatus`, `finalUrl`; `method` widened (`direct-fetch`, `pdf`, `failed`, `error`).
- `ClientOptions.baseUrl` (required) and `ClientOptions.apiKey` in the type definitions.
- A test suite (`npm test`) against a local stub API.
- README documents the HTTP/WebSocket contract to host.

## [2.0.0] - 2026-03-07

### Added
- `bulkScrape(urls, options)` method with concurrency control, progress tracking, and error handling
- `bulkScrape()` convenience function
- `method` option to force specific scraping method (`'auto'`, `'direct'`, `'lightpanda'`, `'puppeteer'`)
- `BulkScrapeOptions` and `BulkScrapeResult` TypeScript interfaces

### Changed
- Bumped minimum Node.js to 18+
- Updated User-Agent to 2.0.0
- Rewrote README — removed emojis, broken links, verbose framework examples

## [1.1.2] - 2025-01-18

### Fixed
- Updated repository URL to correct GitHub location: https://github.com/monostate/browsernative-client
- Fixed bugs URL to point to correct repository issues page
- Synchronized package version with GitHub repository

## [1.1.1] - 2025-05-31

### Fixed
- Updated documentation URLs from browsernative.monostate.ai to bnca.monostate.ai
- Fixed error message to point to correct signup URL
- Updated homepage URL in package.json

### Documentation
- Corrected all website references in README
- Updated support email domain
- Fixed signup and documentation links

## [1.1.0] - 2025-05-31

### Added
- New `quickshot()` method for optimized screenshot capture (2-3x faster)
- New `quickShot()` convenience function for one-line screenshot capture
- TypeScript definitions for new methods

### Changed
- Updated authentication to use `x-api-key` header instead of Bearer token
- Updated default API base URL to production endpoint
- Improved documentation with examples for new quickshot method
- Updated User-Agent to version 1.0.3

### Fixed
- Authentication header format to match deployed API requirements
- README examples and API URLs

### Performance
- Quickshot method provides 2-3x faster screenshot capture by skipping content extraction
- Optimized for visual capture use cases like thumbnails and previews

## [1.0.2] - 2025-05-30

### Initial Release
- Core client SDK functionality
- Methods: scrape, screenshot, analyze, getUsage, healthCheck
- Full TypeScript support
- Convenience functions for quick operations
- Comprehensive documentation and examples