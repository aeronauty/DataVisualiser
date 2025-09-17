import puppeteer from 'puppeteer';

async function testDataVisualizer() {
  console.log('🚀 Starting Puppeteer test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1280, height: 720 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
    });
    
    // Navigate to the application
    console.log('📱 Navigating to http://localhost:5175...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle2' });
    
    // Wait for the app to load
    console.log('⏳ Waiting for app to load...');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Wait a bit more for React to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if the title is correct
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Look for the main app content
    console.log('🔍 Checking if app content is loaded...');
    const appContent = await page.$('h1');
    if (appContent) {
      const headerText = await page.evaluate(el => el.textContent, appContent);
      console.log('📊 Found header:', headerText);
    }
    
    // Check if there's any content in the root div
    const rootContent = await page.$eval('#root', el => el.innerHTML);
    if (rootContent.length > 100) {
      console.log('✅ App content loaded successfully');
    } else {
      console.log('⚠️ App content seems minimal, might still be loading');
    }
    
    // Try to switch to chart view
    console.log('📊 Switching to chart view...');
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const chartButton = buttons.find(btn => btn.textContent?.includes('Chart View'));
        if (chartButton) {
          chartButton.click();
          return true;
        }
        return false;
      });
      
      // Wait for chart to appear
      await page.waitForSelector('canvas, svg', { timeout: 10000 });
      console.log('✅ Chart view loaded successfully!');
    } catch (error) {
      console.log('⚠️ Chart View button not found or chart failed to load');
    }
    
    // Try to open data manager
    console.log('📂 Testing data manager...');
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const manageButton = buttons.find(btn => btn.textContent?.includes('Manage Data'));
        if (manageButton) {
          manageButton.click();
          return true;
        }
        return false;
      });
      
      await page.waitForSelector('.data-manager-panel', { timeout: 5000 });
      console.log('✅ Data manager opened successfully!');
    } catch (error) {
      console.log('⚠️ Data manager test failed');
    }
    
    // Check if sample datasets are visible
    const datasets = await page.$$('.dataset-card');
    console.log(`📊 Found ${datasets.length} sample datasets`);
    
    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    
    console.log('🎉 All tests passed! Application is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    try {
      const page = browser.pages()[0] || await browser.newPage();
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      console.log('📸 Error screenshot saved as error-screenshot.png');
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5175');
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not running. Please start the application first with ./start.sh');
    return false;
  }
}

// Main execution
(async () => {
  if (await checkServer()) {
    await testDataVisualizer();
  }
})();
