interface IHoverProfileData {
  fullname: string;
  aboutme: string;
  describes_me: string;
  picture: string;
  userslug: string;
}

interface IMyRewards {
  // aviyel_custom_projects: number[];
  // meta: IRewardConfigTemplate;
  projects: IRewardProject[];
}

interface IRewardProject {
  project_meta: IProjectMinimal;
  levels: Array<{ nft_url: string; step: number }>;
  rewards: Array<{ step: number; badge_status?: "claimed" }>;
}

interface IProjectMinimal {
  cid: number;
  icon: string;
  name: string;
  slug: string;
}

export type { IMyRewards, IHoverProfileData, IRewardProject };
