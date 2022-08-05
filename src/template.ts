import type { IRewardProject, ISize, ITheme } from "./types";
const DOMAIN = "https://beta.aviyel.com";
function prefixIfNeeded(urlString: string) {
  return new URL(urlString, DOMAIN).href;
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

export function getHTML(reward: IRewardProject, theme: ITheme, size: ISize) {
  const rewards = reward.rewards
    .filter((x) => x.badge_status === "claimed")
    .map((x) => {
      return {
        image: reward.levels.find((l) => +l.step === +x.step)!.nft_url,
        name: theme.levels.find((l) => +l.step === +x.step)!.name,
      };
    });

  return html`<link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400"
      rel="stylesheet"
    />
    <style>
      * {
        position: relative;
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Inter", sans-serif;
        height: ${size.height}px;
        width: ${size.width}px;
        display: flex;
        align-items: center;
        zoom: 2;
      }
    </style>
    <body>
      ${rewards.map(
        ({ image, name }) =>
          html`<div style="padding:0.5rem 1rem;text-align:center">
            <img
              src="${prefixIfNeeded(image)}"
              width="80px"
              crossorigin="anonymous"
              style="margin-bottom:0.5rem"
            />
            <div style="font-size:11px;line-height:16px;color:#464554">
              ${name}
            </div>
          </div>`
      )}
    </body>`;
}
