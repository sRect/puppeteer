const puppeteer = require("puppeteer");
const fs = require("fs");
const { unlink, stat, writeFile } = require("fs/promises");
const path = require("path");
// const html2markdown = require("html2markdown");
const html2md = require("html-to-md");
const chalk = require("chalk");
const articleHref = require("./conf");

console.log("articleHref==>", articleHref);

// 文章url
const href = articleHref;

// 头部、左侧、浏览器插件、相关推荐、全部评论
// 页面中这几个区域全部删除
const rmElArr = [
  ".main-header-box",
  ".article-suspended-panel",
  ".extension",
  ".recommended-area",
  "#comment-box",
];

if (!fs.existsSync(path.join(__dirname, "./article"))) {
  fs.mkdirSync("article");
}

// 删除旧文件
async function rmOldFile({ outMdFilePath, outPdfFilePath, outHtmlfFilePath }) {
  try {
    const [mdStateErr, mdState] = await stat(outMdFilePath)
      .then((data) => [null, data])
      .catch((e) => [e, null]);
    const [pdfStateErr, pdfState] = await stat(outPdfFilePath)
      .then((data) => [null, data])
      .catch((e) => [e, null]);
    const [htmlStateErr, htmlState] = await stat(outHtmlfFilePath)
      .then((data) => [null, data])
      .catch((e) => [e, null]);

    if (mdState) await unlink(outMdFilePath);
    if (pdfState) await unlink(outPdfFilePath);
    if (htmlState) await unlink(outHtmlfFilePath);
  } catch (error) {
    console.log(chalk.red("stat err==>"));
    console.log(error);
  }
}

// 保存html
async function saveToHtml(page, outHtmlfFilePath) {
  const htmlContent = await page.content();

  await writeFile(outHtmlfFilePath, htmlContent, {
    encoding: "utf8",
  });

  console.log(chalk.green("html保存成功"));
}

// 保存markdown
async function saveToMd(page, outMdFilePath) {
  try {
    const articleHtml = await page.$eval("article.article", (e) => {
      return e.innerHTML;
    });

    const mdContent = html2md(articleHtml);

    await writeFile(outMdFilePath, mdContent, {
      encoding: "utf8",
    });

    console.log(chalk.green("md保存成功"));
  } catch (error) {
    console.log(chalk.red("md保存失败"));
  }
}

// 保存pdf
async function saveToPdf(page, outPdfFilePath) {
  await page
    .pdf({
      path: outPdfFilePath,
      displayHeaderFooter: false,
    })
    .then(() => console.log(chalk.green("pdf保存成功")))
    .catch(() => console.error(chalk.red("pdf保存失败")));
}

(async () => {
  console.log(chalk.blueBright("正在初始化..."));

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({
    width: 1920,
    height: 1080,
  });

  await page.goto(href, {
    waitUntil: "domcontentloaded",
    referer: href,
  });
  await page.waitForTimeout(3000); // 确保页面加载完毕

  const title = (await page.title()) || "juejin";
  const outMdFilePath = path.join(__dirname, `./article/${title}.md`);
  const outPdfFilePath = path.join(__dirname, `./article/${title}.pdf`);
  const outHtmlfFilePath = path.join(__dirname, `./article/${title}.html`);

  const queueArr = rmElArr.map((item) => {
    return async () => {
      await page.$eval(item, (div) => {
        // div.style.display = "none";
        div.parentNode.removeChild(div);
      });
    };
  });

  await rmOldFile({ outMdFilePath, outPdfFilePath, outHtmlfFilePath });

  console.log(chalk.blueBright("旧文件删除完成"));

  for await (let fn of queueArr) {
    fn();
  }

  console.log(chalk.blueBright("相关dom处理完成"));
  console.log(chalk.blueBright("正在保存,请等待..."));

  // await saveToHtml(page, outHtmlfFilePath);
  await saveToMd(page, outMdFilePath);
  await saveToPdf(page, outPdfFilePath);

  console.log(chalk.blueBright("操作结束"));
  await browser.close();
})();
