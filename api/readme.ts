import type { IMyRewards } from "../src/types";

import { getHTML } from "../src/template";

export const config = {
  runtime: "experimental-edge",
};

const DOMAIN = "https://beta.aviyel.com";

async function fetchJson<T = any>(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "rewards-image-generator" },
  });
  if (!res.ok) throw new Error("404");
  return res.json() as Promise<T>;
}

export default async (request: Request) => {
  const host = `https://${request.headers.get("host")!}`;
  const { searchParams } = new URL(request.url!, host);
  const userslug = searchParams.get("u");
  const projectId = searchParams.get("p");
  if (!userslug || !projectId) return new Response("Invalid", { status: 400 });

  try {
    const rewards = await fetchJson<IMyRewards>(
      `${DOMAIN}/api/rewards/v1/reward/rewards/${userslug}`
    );

    const reward = rewards.projects.find(
      (p) => p.project_meta.cid === +projectId
    );

    if (!reward) {
      return new Response(void 0, { status: 404 });
    }

    const theme = rewards.meta.theme_types.find(
      (theme) => theme.id === reward.rule.theme_type
    )!;

    const html = await getHTML(reward, theme);

    return new Response(html, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control":
          "public, max-age=300, s-maxage=900, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    console.error(e);
    if (e === "404") {
      return new Response(void 0, { status: 404 });
    }
    return new Response(
      "<h1>Internal Error</h1><p>Sorry, there was a problem</p>",
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
};
