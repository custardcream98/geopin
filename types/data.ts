export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type POIData = {
  coordinate: Coordinate | null;
  [key: string]: unknown;
};

export type ResolvedPOIData = {
  coordinate: Coordinate;
  [key: string]: unknown;
};
