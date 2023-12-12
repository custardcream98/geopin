"use client";

import { useMemo, useState } from "react";
import { redirectToFetchData } from "./OpenDataGeoFieldSelectForm.action";
import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import { parseFieldNameMap } from "../_utils/fieldNameMap";

enum SelectingType {
  Type,
  Address,
  Coordinate,
}

export const OpenDataGeoFieldSelectForm = ({
  searchParams,
  data,
}: {
  searchParams: MainPageSearchParamsWithServiceName;
  data: Record<string, unknown>;
}) => {
  const [selectingType, setSelectingType] =
    useState<SelectingType>(SelectingType.Type);

  const fieldNameMap = parseFieldNameMap(
    searchParams.fieldNameMapString
  );

  const options = useMemo(
    () =>
      Object.entries(data).map(([key, value]) => (
        <option key={key} value={key}>
          '{fieldNameMap[key] ?? key}', 샘플 데이터:{" "}
          {JSON.stringify(value)}
        </option>
      )),
    [data]
  );

  const redirectToFetchDataWithSampleData =
    redirectToFetchData.bind(null, data, searchParams);

  return (
    <div className="w-full">
      <fieldset className="mb-2">
        <legend className="mb-1">
          주소 / 좌표중 어떤 필드를 선택할지 결정해주세요.
        </legend>
        <label>
          <input
            className="mr-2"
            type="radio"
            name="data-type"
            value="address"
            onChange={() =>
              setSelectingType(SelectingType.Address)
            }
          />
          주소 필드 선택하기
        </label>
        <label className="ml-4">
          <input
            className="mr-2"
            type="radio"
            name="data-type"
            value="coordinate"
            onChange={() =>
              setSelectingType(SelectingType.Coordinate)
            }
          />
          좌표 필드 선택하기
        </label>
      </fieldset>
      {selectingType !== SelectingType.Type && (
        <form action={redirectToFetchDataWithSampleData}>
          <div className="flex flex-col gap-2">
            {selectingType === SelectingType.Address && (
              <>
                <label htmlFor="addressField">
                  주소 필드 선택
                </label>
                <select
                  name="addressField"
                  id="addressField"
                  className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
                  defaultValue={Object.keys(data)[0]}
                >
                  {options}
                </select>
              </>
            )}
            {selectingType === SelectingType.Coordinate && (
              <>
                <label htmlFor="latitudeField">
                  위도 필드 선택
                </label>
                <select
                  name="latitudeField"
                  id="latitudeField"
                  className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
                  defaultValue={Object.keys(data)[0]}
                >
                  {options}
                </select>
                <label htmlFor="longitudeField">
                  경도 필드 선택
                </label>
                <select
                  name="longitudeField"
                  id="longitudeField"
                  className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
                  defaultValue={Object.keys(data)[0]}
                >
                  {options}
                </select>
              </>
            )}
          </div>
          <button className="mx-2 p-2 shadow rounded block w-full mt-2">
            데이터 불러오기
          </button>
        </form>
      )}
    </div>
  );
};
