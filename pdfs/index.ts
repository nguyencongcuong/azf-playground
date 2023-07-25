import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import puppeteer, {Browser, Page} from "puppeteer";

let browser: Browser;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  let page: Page;

  try {
    if (req.method === "POST") {
      const { html, options } = req.body;

      /*
       * By default, Puppeteer use global bundled Chromium store in the global .cache directory
       * However, this bundled Chromium might be lost after Pipeline building steps
       * To solve: use executablePath options like below to specify the browser directory
       *
       * Note: Each Puppeteer version comes with a pre-defined version of Chromium
       * See here for more details: https://pptr.dev/chromium-support
       */

      if(!browser) {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: '/home/site/wwwroot/chrome/win64-117.0.5908.0/chrome-win64/chrome',
          args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
      }

      page = await browser.newPage();
      
      await page.setContent(html);

      const pdfBuffer = await page.pdf(options);

      await page.close();

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

// ? await puppeteer.launch({
//   headless: "new",
//   executablePath: '/home/site/wwwroot/chrome/linux-117.0.5893.0/chrome-linux64/chrome',
//   args: ["--no-sandbox", "--disable-setuid-sandbox"],
// })
// : process.env.APP_ENV && process.env.PLATFORM === 'windows'
// ? await puppeteer.launch({
//   headless: "new",
//   executablePath: '/home/site/wwwroot/chrome/win64-117.0.5908.0/chrome-win64/chrome',
//   args: ["--no-sandbox", "--disable-setuid-sandbox"],
// })