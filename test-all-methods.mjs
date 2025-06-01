// Test all client SDK methods with the deployed API
import { BrowserNativeClient } from './index.js';

const API_KEY = 'bnca_demo_key_for_visual_testing';
const TEST_URL = 'https://example.com';

async function testAllMethods() {
  console.log('🧪 Testing Browser Native Client SDK v1.1.0\n');
  
  const client = new BrowserNativeClient(API_KEY, {
    verbose: true,
    baseUrl: 'https://bnca-api.fly.dev'
  });
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Basic scrape
  console.log('\n1️⃣ Testing client.scrape()...');
  try {
    const result = await client.scrape(TEST_URL);
    if (result.success && result.data) {
      console.log('✅ Scrape successful');
      console.log(`   Title: ${result.data.data?.title || 'N/A'}`);
      console.log(`   Method: ${result.data.metadata?.method}`);
      passed++;
    } else {
      console.log('❌ Scrape failed:', result.error);
      failed++;
    }
  } catch (error) {
    console.log('❌ Scrape error:', error.message);
    failed++;
  }
  
  // Test 2: Screenshot with content
  console.log('\n2️⃣ Testing client.screenshot()...');
  try {
    const result = await client.screenshot(TEST_URL);
    if (result.success && result.data) {
      console.log('✅ Screenshot successful');
      console.log(`   Has screenshot: ${!!result.data.metadata?.screenshot}`);
      console.log(`   Has content: ${!!result.data.data}`);
      passed++;
    } else {
      console.log('❌ Screenshot failed:', result.error);
      failed++;
    }
  } catch (error) {
    console.log('❌ Screenshot error:', error.message);
    failed++;
  }
  
  // Test 3: Quick screenshot (new method)
  console.log('\n3️⃣ Testing client.quickshot() [NEW]...');
  try {
    const result = await client.quickshot(TEST_URL);
    if (result.success && result.data) {
      console.log('✅ Quickshot successful');
      console.log(`   Has screenshot: ${!!result.data.screenshot}`);
      console.log(`   Response time: ${result.responseTime}ms`);
      console.log(`   Method: ${result.data.metadata?.method}`);
      passed++;
    } else {
      console.log('❌ Quickshot failed:', result.error);
      failed++;
    }
  } catch (error) {
    console.log('❌ Quickshot error:', error.message);
    failed++;
  }
  
  // Test 4: AI Analysis
  console.log('\n4️⃣ Testing client.analyze()...');
  try {
    const result = await client.analyze(TEST_URL, 'What is the main topic of this page?');
    if (result.success && result.data) {
      console.log('✅ Analyze successful');
      console.log(`   Answer: ${result.data.answer}`);
      console.log(`   Method: ${result.data.metadata?.method}`);
      passed++;
    } else {
      console.log('❌ Analyze failed:', result.error);
      failed++;
    }
  } catch (error) {
    console.log('❌ Analyze error:', error.message);
    failed++;
  }
  
  // Test 5: Health check
  console.log('\n5️⃣ Testing client.healthCheck()...');
  try {
    const result = await client.healthCheck();
    if (result.success && result.data) {
      console.log('✅ Health check successful');
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Version: ${result.data.version}`);
      passed++;
    } else {
      console.log('❌ Health check failed:', result.error);
      failed++;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    failed++;
  }
  
  // Test 6: Usage stats
  console.log('\n6️⃣ Testing client.getUsage()...');
  try {
    const result = await client.getUsage(7);
    if (result.success) {
      console.log('✅ Usage stats successful');
      console.log(`   Response received`);
      passed++;
    } else {
      console.log('❌ Usage stats failed:', result.error);
      failed++;
    }
  } catch (error) {
    console.log('❌ Usage stats error:', error.message);
    failed++;
  }
  
  // Summary
  console.log('\n\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! SDK is ready for publishing.');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix before publishing.');
  }
}

// Run tests
testAllMethods().catch(console.error);