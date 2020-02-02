const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(path.join(__dirname, './assets'))) {
  fs.mkdirSync('assets');
}

// 打开百度并保存截图
// puppeteer.launch({
//   headless: false, // headless 是否启用"无头模式"(隐藏浏览器界面), 默认为true
//   devtools: true, // 默认不自动打开devtools
//   // executablePath: '', // 指定chrome.exe文件的路径(不使用内置的chromium)
//   // args: [
//   //   '--disable-web-security', // 允许跨域
//   //   '--proxy-server=127.0.0.1:1080', // 代理
//   // ]
// })
//   .then(async browser => {
//     // 打开一个页面
//     const page = await browser.newPage();
//     // 打开百度
//     await page.goto('https://www.baidu.com');
//     await page.screenshot({
//       path: './assets/baidu.png'
//     });
//     await browser.close();
//   });

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