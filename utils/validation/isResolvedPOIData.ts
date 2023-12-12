import type {
  POIData,
  ResolvedPOIData,
} from "@/types/data";

export const isResolvedPOIData = (
  data: POIData
): data is ResolvedPOIData => {
  return data.coordinate !== null;
};
