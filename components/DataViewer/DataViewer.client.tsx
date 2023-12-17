"use client";

import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import type { POIData } from "@/types/data";
import { useInfiniteQuery } from "@tanstack/react-query";
import { KakaoMap } from "../KakaoMap";
import { isResolvedPOIData } from "@/utils/validation/isResolvedPOIData";
import { pickDataKey } from "./DataViewer.action";

const PAGE_SIZE = 20;

export const DataViewer = ({
  searchParams,
  fieldNameMap,
}: {
  searchParams: MainPageSearchParamsWithServiceName;
  fieldNameMap: Record<string, string>;
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

  return (
    !!dataWithCoordinate.length && (
      <>
        <details>
          <summary>데이터 필드 선택하기</summary>
          <form
            className="overflow-x-scroll"
            action={pickDataKey.bind(null, searchParams)}
          >
            {Object.keys(dataWithCoordinate[0])
              .filter((key) => key !== "coordinate")
              .map((key) => {
                return (
                  <label key={key} className="block">
                    <input
                      className="mr-2"
                      type="checkbox"
                      name="data-key-pick"
                      value={key}
                      defaultChecked={searchParams.dataKeyPick?.includes(
                        key
                      )}
                    />
                    {fieldNameMap[key] ?? key}
                  </label>
                );
              })}
            <button
              type="submit"
              className="mx-2 p-2 shadow rounded block w-full my-2"
            >
              선택
            </button>
          </form>
        </details>
        <div className="my-2">
          데이터 수: {dataWithCoordinate.length}
        </div>
        <button
          className="mx-2 p-2 shadow rounded block w-full my-2"
          type="button"
          disabled={!hasNextPage}
          onClick={() => fetchNextPage()}
        >
          데이터 더 불러오기 ({dataWithCoordinate.length}/
          {data?.pages[0].totalCount})
        </button>
        <div className="my-2">
          마커를 누르면 선택한 데이터 필드 정보가
          표시됩니다.
        </div>
        <div className="w-full h-[80vh]">
          <KakaoMap
            data={dataWithCoordinate}
            dataKeyPick={searchParams.dataKeyPick}
            fieldNameMap={fieldNameMap}
          />
        </div>
      </>
    )
  );
};
