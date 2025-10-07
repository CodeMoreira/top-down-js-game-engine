export type ObjectBaseOptions = {
  width: number;
  height: number;
  texture: string;
};

export type DynamicObjectBaseOptions = {
  width: number;
  height: number;
  speed: number;
  texture: string;
};

export type ObjectOptions = {
  staticObjects: Record<string, ObjectBaseOptions>;
  dynamicObjects: Record<string, DynamicObjectBaseOptions>;
  characters: Record<string, DynamicObjectBaseOptions>;
};
