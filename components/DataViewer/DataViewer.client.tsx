"use client";

import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import { KakaoMap } from "../KakaoMap";
import { pickDataKey } from "./DataViewer.action";
import { useInfiniteOpenData } from "../_hooks/useInfiniteOpenData";
import { TableViewer } from "../TableViewer";

const PAGE_SIZE = 20;

export const DataViewer = ({
  searchParams,
  fieldNameMap,
}: {
  searchParams: MainPageSearchParamsWithServiceName;
  fieldNameMap: Record<string, string>;
}) => {
  const { data, fetchNextPage, hasNextPage, totalCount } =
    useInfiniteOpenData({
      searchParams,
    });

  return (
    !!data.length && (
      <>
        <details>
          <summary>데이터 필드 선택하기</summary>
          <form
            className="overflow-x-scroll"
            action={pickDataKey.bind(null, searchParams)}
          >
            {Object.keys(data[0])
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
        <div className="my-2">데이터 수: {data.length}</div>
        <button
          className="mx-2 p-2 shadow rounded block w-full my-2"
          type="button"
          disabled={!hasNextPage}
          onClick={() => fetchNextPage()}
        >
          데이터 더 불러오기 ({data.length} / {totalCount})
        </button>
        <div className="my-2">
          마커를 누르면 선택한 데이터 필드 정보가
          표시됩니다.
        </div>
        <div className="w-full h-[80vh]">
          <KakaoMap
            data={data}
            dataKeyPick={searchParams.dataKeyPick}
            fieldNameMap={fieldNameMap}
          />
        </div>
        <TableViewer
          searchParams={searchParams}
          fieldNameMap={fieldNameMap}
        />
      </>
    )
  );
};
