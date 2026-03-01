const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('http://localhost:3033');
  await page.waitForTimeout(5000); // Give it time to render
  await page.screenshot({ path: '/mnt/ramdisk/cute_soul/assets/preview.png' });
  await browser.close();
})();
