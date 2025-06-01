import { BrowserNativeClient } from './index.js';

console.log('🧪 Testing Screenshot Functionality\n');

const client = new BrowserNativeClient('bnca_test_key_for_local_testing_123456789', {
  baseUrl: 'https://bnca-api.fly.dev',
  verbose: true
});

async function testScreenshot() {
  console.log('📸 Testing screenshot capture...');
  try {
    const result = await client.screenshot('https://example.com');
    console.log('\nResult:', {
      success: result.success,
      hasScreenshot: !!result.data?.screenshot,
      screenshotLength: result.data?.screenshot?.length || 0,
      error: result.error
    });
    
    if (result.data?.screenshot) {
      // Check if it's a valid base64 image
      const isBase64Image = result.data.screenshot.startsWith('data:image/');
      console.log('Is valid base64 image:', isBase64Image);
      
      // Extract just the base64 part
      const base64Data = result.data.screenshot.split(',')[1];
      console.log('Base64 data length:', base64Data?.length || 0);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testScreenshot();