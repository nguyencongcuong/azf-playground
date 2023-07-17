import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import puppeteer, {Browser, Page} from "puppeteer";
import * as fs from "fs";
import * as path from "path";

console.log('[Load Template with Fonts] Start')

const template = fs.readFileSync(path.resolve() + '/pdfs/assets/templates/template_03.html').toString();

const notoSansSC = fs.readFileSync(path.resolve() + '/pdfs/assets/base64-fonts/NotoSansSC-Regular.txt').toString();
const notoSansTC = fs.readFileSync(path.resolve() + '/pdfs/assets/base64-fonts/NotoSansTC-Regular.txt').toString();
const notoSansKR = fs.readFileSync(path.resolve() + '/pdfs/assets/base64-fonts/NotoSansKR-Regular.txt').toString();
const notoSansHK = fs.readFileSync(path.resolve() + '/pdfs/assets/base64-fonts/NotoSansHK-Regular.txt').toString();

const notoSansArabic = fs.readFileSync(path.resolve() + '/pdfs/assets/base64-fonts/NotoSansArabic-Regular.txt').toString();
const notoSansJP = fs.readFileSync(path.resolve() + '/pdfs/assets/base64-fonts/NotoSansJP-Regular.txt').toString();
const notoSansMalayalam = fs.readFileSync(path.resolve() + '/pdfs/assets/base64-fonts/NotoSansMalayalam-Regular.txt').toString();
const notoSansThai = fs.readFileSync(path.resolve() + '/pdfs/assets/base64-fonts/NotoSansThai-Regular.txt').toString();

const templateWithFonts = template
  .replace("__NOTO_SANS_SC__", notoSansSC)
  .replace("__NOTO_SANS_TC__", notoSansTC)
  .replace("__NOTO_SANS_KR__", notoSansKR)
  .replace("__NOTO_SANS_HK__", notoSansHK)
  .replace("__NOTO_SANS_ARABIC__", notoSansArabic)
  .replace("__NOTO_SANS_JP__", notoSansJP)
  .replace("__NOTO_SANS_MALAYALAM__", notoSansMalayalam)
  .replace("__NOTO_SANS_THAI__", notoSansThai);

console.log('[Load Template with Fonts] End')

let browser: Browser;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('[AZF Trigger] Start')
  
  let page: Page;

  try {
    if (req.method === "POST") {
      const { html, options } = req.body;

      context.log('[templateWithFonts.replace] Start')

      const populatedHTML = templateWithFonts
        .replace(/__HTML__/g, html)

      context.log('[templateWithFonts.replace] End')

      /*
       * By default, Puppeteer use global bundled Chromium store in the global .cache directory
       * However, this bundled Chromium might be lost after Pipeline building steps
       * To solve: use executablePath options like below to specify the browser directory
       *
       * Note: Each Puppeteer version comes with a pre-defined version of Chromium
       * See here for more details: https://pptr.dev/chromium-support
       */

      if(!browser) {
        context.log('[puppeteer.launch] Start')
        browser = process.env.APP_ENV
            ? await puppeteer.launch({
              headless: "new",
              executablePath: '/home/site/wwwroot/chrome/linux-117.0.5893.0/chrome-linux64/chrome',
              args: ["--no-sandbox", "--disable-setuid-sandbox"],

            })
            : await puppeteer.launch({
              headless: "new",
            });
        context.log('[puppeteer.launch] End')
      }

      page = await browser.newPage();
      
      context.log('[page.setContent] Start')
      await page.setContent(populatedHTML);
      context.log('[page.setContent] End')

      context.log('[page.pdf] Start')
      const pdfBuffer = await page.pdf(options);
      context.log('[page.pdf] End')

      await page.close();

      // fs.writeFileSync(path.resolve() + '/pdfs/label.pdf', pdfBuffer);

      context.log('[AZF Trigger] End')

      context.res = {
        body: pdfBuffer,
      };
    } else {
      context.res = {
        body: `Azure Function /pdfs on ${process.env.APP_ENV} is running`,
      };
    }
  } catch (e) {
    await page.close();
    context.res = {
      body: e.message,
    };
  }
};

export default httpTrigger;
