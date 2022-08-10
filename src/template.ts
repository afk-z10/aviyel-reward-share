import type { IRewardProject, ISize, ITheme } from "./types";

function rewriteImageURL(urlString: string, host: string) {
  return urlString.replace(
    "/assets/uploads/rewards/project_rewards",
    `${host}/images`
  );
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

export function getHTML(
  reward: IRewardProject,
  theme: ITheme,
  size: ISize,
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

  return html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${size.width} ${size.height}"
    width="${size.width}"
    height="${size.height}"
  >
    <defs>
      <style type="text/css">
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400");
      </style>
    </defs>

    ${rewards.map(({ image, name }, i) => {
      let x = i * 80 + (2 * i + 1) * 8;

      return html` <image
          href="${rewriteImageURL(image, host)}"
          width="80"
          height="80"
          x="${x}"
          y="8"
        />
        <text
          x="${x + 88 / 2}"
          y="110"
          font-size="11"
          fill="#464554"
          text-anchor="middle"
          style="font-family: 'Inter';"
        >
          ${name}</text
        >`;
    })}
  </svg>`;
}
