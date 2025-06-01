# Changelog

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