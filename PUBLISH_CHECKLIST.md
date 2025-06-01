# Publishing Checklist for @monostate/browsernative-client v1.1.0

## ✅ Pre-publish Verification

### Code Changes
- [x] Added `quickshot()` method to main client class
- [x] Added `quickShot()` convenience function
- [x] Updated authentication header from Bearer to x-api-key
- [x] Updated TypeScript definitions
- [x] Updated README with new method documentation
- [x] Bumped version to 1.1.0
- [x] Created CHANGELOG.md

### Testing
- [x] All SDK methods tested successfully (100% pass rate)
- [x] Quickshot method confirmed working with deployed API
- [x] Authentication verified with x-api-key header
- [x] Response formats validated

### Documentation
- [x] README updated with quickshot examples
- [x] TypeScript definitions complete
- [x] API reference documentation updated
- [x] CHANGELOG created with version notes

## 📦 Publishing Steps

1. **Ensure you're logged in to npm:**
   ```bash
   npm whoami
   # If not logged in:
   npm login
   ```

2. **Verify package contents:**
   ```bash
   npm pack --dry-run
   ```
   Should include:
   - index.js
   - index.d.ts
   - README.md
   - package.json
   - CHANGELOG.md

3. **Publish to npm:**
   ```bash
   npm publish
   ```

4. **Verify publication:**
   ```bash
   npm view @monostate/browsernative-client@1.1.0
   ```

## 🎯 What's New in v1.1.0

### For Users
- **New quickshot method**: 2-3x faster screenshot capture
- **Better authentication**: Now uses x-api-key header
- **Production-ready**: Points to deployed API endpoint

### API Changes
- `client.quickshot(url)` - New method for fast screenshots
- `quickShot(url, apiKey)` - New convenience function
- Authentication header changed from `Authorization: Bearer` to `x-api-key`

## 📝 Post-publish Tasks

1. Update any example projects with new version
2. Announce the update in relevant channels
3. Monitor for any issues or feedback

## 🚀 Ready to Publish!

All tests pass, documentation is updated, and the SDK is ready for npm publication.