import { IncomingMessage, ServerResponse } from "http";
import { parse } from "regexparam";
import axios from "axios";
import { getHTML } from "../src/template";
import { getScreenshot } from "../src/chromium";
import { IMyRewards } from "../src/types";

function exec<T = {}>(
  path: string,
  result: {
    keys: string[];
    pattern: RegExp;
  }
) {
  let i = 0,
    out = {} as T;
  let matches = result.pattern.exec(path);

  while (matches && i < result.keys.length) {
    out[result.keys[i]] = matches[++i] || null;
  }
  return out;
}

async function fetchJson<T = any>(url: string) {
  const res = await axios.get<T>(url);
  return res.data;
}

const DOMAIN = "https://beta.aviyel.com";

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const { userslug, projectId, type } = exec<{
      userslug: string;
      projectId: string;
      type: string;
    }>(url.pathname, parse("/api/:userslug/:projectId/:type?"));

    if (!userslug || !projectId) {
      response.statusCode = 404;
      response.end();
      return;
    }

    const rewards = await fetchJson<IMyRewards>(
      `${DOMAIN}/api/rewards/v1/reward/rewards/${userslug}`
    );

    const reward = rewards.projects.find(
      (p) => p.project_meta.cid === +projectId
    );

    if (!reward) {
      response.statusCode = 404;
      response.end();
      return;
    }

    const size = {
      height: 120,
      width: 560,
    };

    const theme = rewards.meta.theme_types.find(
      (theme) => theme.id === reward.rule.theme_type
    );

    const html = getHTML(reward, theme, size);
    const isHTML = type === "html";
    if (isHTML) {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.end(html);
      return;
    }

    const fileType = type === "jpeg" ? "jpeg" : "png";

    const image = await getScreenshot(html, fileType, size);
    response.statusCode = 200;
    response.setHeader("Content-Type", `image/${fileType}`);
    response.setHeader(
      "Cache-Control",
      `public, s-maxage=300, stale-while-revalidate=600`
    );
    response.end(image);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response.status === 404) {
        response.statusCode = 404;
        response.end();
        return;
      }
    }
    response.statusCode = 500;
    response.setHeader("Content-Type", "text/html");
    response.end("<h1>Internal Error</h1><p>Sorry, there was a problem</p>");
    console.error(e);
  }
}
