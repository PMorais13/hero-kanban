export type HeroAttribute = {
  readonly label: string;
  readonly value: number;
};

export type HeroTrait = {
  readonly title: string;
  readonly description: string;
};

export type HeroSheet = {
  readonly name: string;
  readonly title: string;
  readonly lineage: string;
  readonly heroClass: string;
  readonly guild: string;
  readonly alignment: string;
  readonly banner: string;
  readonly signature: string;
  readonly attributes: readonly HeroAttribute[];
  readonly traits: readonly HeroTrait[];
};
