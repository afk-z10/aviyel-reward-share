import { bgSvg } from "./bg";
import { IHoverProfileData, IRewardProject } from "./types";

const badgeSizes = [80, 144, 112, 112, 92, 80];
const DOMAIN = "https://beta.aviyel.com";

function prefixIfNeeded(urlString: string) {
  if (urlString.indexOf("http://") === 0 || urlString.indexOf("https://") === 0)
    return urlString;

  return `${DOMAIN}${urlString}`;
}

export function getHTML(
  reward: IRewardProject,
  userProfile: IHoverProfileData
) {
  const project_icon = prefixIfNeeded(reward.project_meta.icon);
  const project_name = reward.project_meta.name;

  const user_picture = prefixIfNeeded(userProfile.picture);
  const username = userProfile.fullname || userProfile.userslug;
  const rewards = reward.rewards
    .filter((x) => x.badge_status === "claimed")
    .map((x) => {
      return reward.levels.find((l) => +l.step === +x.step).nft_url;
    });

  const image_size = badgeSizes[rewards.length];

  return `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600" rel="stylesheet">
  <body style="margin:0">
  <div style="position: relative; padding: 20px 12px 12px 12px; width: 500px; height: 260px; background-color: #fff; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Inter', sans-serif;box-sizing: border-box;">
    <div style="position: absolute; top: 0; right: 0">
      ${bgSvg}
    </div>
    <div style="position: relative; display: flex; justify-content: center; align-items: center; gap: 12px;">
      <img crossorigin="anonymous" src="${project_icon}" style="width: 32px" />
      <div style="font-size: 18px; line-height: 22px; font-weight: 600; color: #21202d;">
        ${project_name}
      </div>
    </div>
    <div style="position: relative; display: flex; justify-content: center; align-items: center; gap: 12px;">
    ${rewards
      .map(
        (reward_image) =>
          `<img src="${prefixIfNeeded(
            reward_image
          )}" style="width: ${image_size}px" crossorigin="anonymous" />`
      )
      .join("")}
    </div>
    <div style="position: relative; display: flex; align-items: center; gap: 12px">
      <img src="${user_picture}" crossorigin="anonymous" style="height: 24px; width: 24px; object-fit: cover; border-radius: 12px" />
      <div style="font-size: 12px; line-height: 1.25; font-weight: 500; color: #464554;">
        ${username}
      </div>
    </div>
  </div></body>
  `;
}
