import type { IRewardProject, ITheme } from "./types";

function rewriteImageURL(urlString: string, host: string) {
  return `${host}/cdn-cgi/image/format=png,width=256${urlString}`;
}

type StringLike = string | number;
function html(
  strings: TemplateStringsArray,
  ...args: Array<StringLike | Array<StringLike>>
): string {
  let htmlString = "";
  strings.forEach((val, index) => {
    htmlString += val;
    let arg = args[index];
    if (Array.isArray(arg)) {
      arg = arg.join("");
    }
    htmlString += arg ?? "";
  });
  return htmlString;
}

function base64ToBrowser(buffer: ArrayBuffer) {
  return btoa(
    Array.from(new Uint8Array(buffer))
      .map((bin) => String.fromCharCode(bin))
      .join("")
  );
}

async function toDataURL(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "rewards-image-generator" },
  });
  const buffer = await response.arrayBuffer();
  const base64 = base64ToBrowser(buffer);
  return `data:image/png;base64,${base64}`;
}

export async function getHTML(
  reward: IRewardProject,
  theme: ITheme,
  host: string
) {
  const rewards = reward.rewards
    .filter((x) => x.badge_status === "claimed")
    .map((x) => {
      return {
        image: reward.levels.find((l) => +l.step === +x.step)!.nft_url,
        name: theme.levels.find((l) => +l.step === +x.step)!.name,
      };
    });

  const images = await Promise.all(
    rewards.map(({ image }) => toDataURL(rewriteImageURL(image, host)))
  );

  const height = 120;
  const width = 96 * rewards.length;

  return html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${width} ${height}"
    width="${width * 2}"
    height="${height * 2}"
  >
    <style>
      text {
        fill: #464554;
      }
      @media (prefers-color-scheme: dark) {
        text {
          fill: #fff;
        }
      }
    </style>
    ${rewards.map(({ name }, i) => {
      let x = i * 80 + (2 * i + 1) * 8;

      return html`<image
          href="${images[i]}"
          width="80"
          height="80"
          x="${x}"
          y="8"
        />
        <text
          x="${x + 88 / 2}"
          y="110"
          font-size="11"
          text-anchor="middle"
          style="font-family:sans-serif;"
          >${name}
        </text>`;
    })}
  </svg>`;
}
