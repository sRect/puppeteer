## puppeteer

```javascript
const puppeteer = require('puppeteer');
// 保存pdf/保存图片
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://baidu.com', {
    waitUntil: 'networkidle2'
  });
  await page.screenshot({
    path: './assets/baidu.png'
  });
  await page.pdf({
    path: path.join(__dirname, '/assets/baidu.pdf'),
    format: 'A4'
  });

  await browser.close();
})();
```