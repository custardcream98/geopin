import { useInfiniteQuery } from "@tanstack/react-query";

import { isResolvedPOIData } from "@/utils/validation/isResolvedPOIData";

import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import type { POIData } from "@/types/data";

const PAGE_SIZE = 20;

export const useInfiniteOpenData = ({
  searchParams,
}: {
  searchParams: MainPageSearchParamsWithServiceName;
}) => {
  const { data, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["data", searchParams],
      queryFn: ({ pageParam: { start, end } }) => {
        const data = fetch(
          `/open-data/seoul?${new URLSearchParams({
            serviceName: searchParams.serviceName,
            start: start.toString(),
            end: end.toString(),
            ...(searchParams.fieldType === "address"
              ? {
                  fieldType: "address",
                  addressFieldName:
                    searchParams.addressFieldName,
                }
              : {
                  fieldType: "coordinate",
                  latitudeFieldName:
                    searchParams.latitudeFieldName,
                  longitudeFieldName:
                    searchParams.longitudeFieldName,
                  epsg: searchParams.epsg,
                }),
          })}`
        ).then((res) => res.json());

        return data as unknown as {
          totalCount: number;
          data: POIData[];
        };
      },
      initialPageParam: {
        start: 1,
        end: PAGE_SIZE,
      },
      getNextPageParam: (
        lastPage,
        _allPages,
        lastPageParam
      ) => {
        const { totalCount } = lastPage;
        const { end } = lastPageParam;
        const nextStart = end + 1;
        const nextEnd = Math.min(
          end + PAGE_SIZE,
          totalCount
        );

        if (nextStart > nextEnd) {
          return undefined;
        }

        return {
          start: nextStart,
          end: nextEnd,
        };
      },
    });

  const allData =
    data?.pages.flatMap((page) => page.data) ?? [];

  const dataWithCoordinate = allData.filter(
    isResolvedPOIData
  );

  return {
    data: dataWithCoordinate,
    fetchNextPage,
    hasNextPage,
    totalCount: data?.pages[0]?.totalCount ?? 0,
  };
};
