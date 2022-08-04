import { IncomingMessage, ServerResponse } from "http";
import { parse, RouteParams } from "regexparam";
import axios from "axios";
import { getHTML } from "../src/template";
import { getScreenshot } from "../src/chromium";
import { IMyRewards } from "../src/types";

async function fetchJson<T = any>(url: string) {
  const res = await axios.get<T>(url);
  return res.data;
}

const DOMAIN = "https://beta.aviyel.com";

function parseRoute<T extends string>(
  route: T,
  path: string
): RouteParams<T> | null {
  const result = parse(route);
  const matches = result.pattern.exec(path);

  if (!matches) return null;

  type IKeys = Array<keyof RouteParams<T>>;
  type IValue = RouteParams<T>[keyof RouteParams<T>];

  return (result.keys as IKeys).reduce(
    (a, current, index) => (
      (a[current] = matches[index + 1] as unknown as IValue), a
    ),
    {} as RouteParams<T>
  );
}

const validTypes = ["jpeg", "png", "html", undefined];

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  try {
    const url = new URL(request.url!, `http://${request.headers.host}`);

    if (url.hash || url.search) {
      response.statusCode = 400;
      response.end();
      return;
    }

    const route = "/api/:userslug/:projectId/:type?";

    const parsedValue = parseRoute(route, request.url!);

    if (!parsedValue || !validTypes.includes(parsedValue.type)) {
      response.statusCode = 404;
      response.end();
      return;
    }

    const { userslug, projectId, type } = parsedValue;

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
    )!;

    const html = getHTML(reward, theme, size);
    const isHTML = type === "html";
    if (isHTML) {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.end(html);
      return;
    }

    const fileType = type === "jpeg" ? "jpeg" : "png";

    const image = await getScreenshot(html, fileType, {
      height: size.height * 2,
      width: size.width * 2,
    });
    response.statusCode = 200;
    response.setHeader("Content-Type", `image/${fileType}`);
    response.setHeader(
      "Cache-Control",
      `public, max-age=300, s-maxage=900, stale-while-revalidate=604800`
    );
    response.end(image);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response?.status === 404) {
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
