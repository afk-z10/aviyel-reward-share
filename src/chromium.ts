import core from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import { ISize } from "./types";

type FileType = "png" | "jpeg";

let _page: core.Page | null;

const isDev = !process.env.AWS_REGION;
const exePath =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
    ? "/usr/bin/google-chrome"
    : "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";

async function getPage() {
  if (_page) {
    return _page;
  }

  const browser = await core.launch({
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins",
      "--disable-site-isolation-trials",
      ...(isDev ? [] : chrome.args),
    ],
    executablePath: isDev ? exePath : await chrome.executablePath,
    headless: isDev ? true : chrome.headless,
  });
  _page = await browser.newPage();
  return _page;
}

export async function getScreenshot(html: string, type: FileType, size: ISize) {
  const page = await getPage();
  await page.setViewport(size);
  await page.setContent(html, { waitUntil: "networkidle0" });

  const file = await page.screenshot({ type });
  return file;
}
