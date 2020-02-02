const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const URL = 'http://es6.ruanyifeng.com';

if (!fs.existsSync(path.join(__dirname, './es6-ruanyifeng'))) {
  fs.mkdirSync('es6-ruanyifeng');
}

function toPDF({
    name,
    href,
    index,
    resultArrLen,
    browser
  }) {
  return async () => {
    try {
      console.log("enter", index + 1);
      const page = await browser.newPage();
      await page.goto(href, {
        watiUntil: 'domcontentloaded',
        referer: URL
      });
      await page.waitFor(5000);
      await page.pdf({
        path: path.join(__dirname, `/es6-ruanyifeng/${index + 1}-${name}.pdf`)
      }).then(() => {
        console.log(`已保存: ${name}, index:${index + 1}, total: ${resultArrLen}`);
      })
    } catch (error) {
      console.log(`保存失败: ${name}, index:${index + 1}, total: ${resultArrLen}`);
    }
  }
}

(async () => {
  let browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(URL, {
    // timeout: 5000,
    watiUntil: 'domcontentloaded',
    referer: URL
  });

  await page.waitFor(5000); // 等待五秒，确保页面加载完毕

  // 获取导航左侧的所有链接及地址
  const sidebarList = await page.$$('#sidebar ol li a');
  const resultArr = await page.evaluate((...els) => {
    return els.map(a => ({
      name: a.innerText,
      href: a.href.trim()
    }))
  }, ...sidebarList);

  // console.log(resultArr);
  /**
   * [ { name: '前言', href: 'http://es6.ruanyifeng.com/#README' },
  { name: 'ECMAScript 6简介',
    href: 'http://es6.ruanyifeng.com/#docs/intro' },
  { name: 'let 和 const 命令',
    href: 'http://es6.ruanyifeng.com/#docs/let' },
  ...]
  */
  const resultArrLen = resultArr.length;
  const newResultArr = resultArr.map(({
    name,
    href
  }, index) => {
    return toPDF({
      name,
      href,
      index,
      resultArrLen,
      browser
    });
  });

  let iterator = newResultArr[Symbol.iterator]();

  async function run() {
    let obj = iterator.next();
    if (!obj.done) {
      let fn = obj.value;
      await fn();
      run();
    }
  }
  run();
  console.log("正在保存,请耐心等待...");

  // await browser.close();
})();