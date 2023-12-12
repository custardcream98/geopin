import { redirect } from "next/navigation";

import { KakaoMap } from "./KakaoMap";

import { getOpenDataSeoul } from "@/utils/openData/seoul/seoul.server";
import { getGeocode } from "@/utils/vworld/geocode.server";
import { isResolvedPOIData } from "@/utils/validation/isResolvedPOIData";
import { omit } from "@/utils/object";

import type { POIData } from "@/types/data";
import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import { parseFieldNameMap } from "./_utils/fieldNameMap";
import { transform } from "@/utils/epsg/transform";

const getResolvedData = async ({
  coordinateResolver,
  searchParams,
}: {
  coordinateResolver: (
    data: Record<string, unknown>
  ) => Promise<{
    latitude: number;
    longitude: number;
  } | null>;
  searchParams: MainPageSearchParamsWithServiceName;
}): Promise<POIData[]> => {
  const data = (
    await getOpenDataSeoul({
      serviceName: searchParams.serviceName,
    })
  ).row;

  const filterDuplicateData = (
    data: Record<string, unknown>[]
  ) => {
    if (searchParams.fieldType === "address") {
      const addressFieldName =
        searchParams.addressFieldName;

      return data.filter(
        (row, index, array) =>
          array.findIndex(
            (row2) =>
              row[addressFieldName] ===
              row2[addressFieldName]
          ) === index
      );
    }

    const latitudeFieldName =
      searchParams.latitudeFieldName;
    const longitudeFieldName =
      searchParams.longitudeFieldName;

    return data.filter(
      (row, index, array) =>
        array.findIndex(
          (row2) =>
            row[latitudeFieldName] ===
              row2[latitudeFieldName] &&
            row[longitudeFieldName] ===
              row2[longitudeFieldName]
        ) === index
    );
  };

  return Promise.all(
    filterDuplicateData(data).map(async (row) => {
      try {
        const coordinate = await coordinateResolver(row);
        return {
          ...row,
          coordinate,
        };
      } catch (error) {
        return {
          ...row,
          coordinate: null,
        };
      }
    })
  );
};

const geocodeAddress = async (
  addressFieldName: string,
  data: Record<string, unknown>
) => {
  const address = data[addressFieldName];
  if (typeof address !== "string") {
    return null;
  }

  const {
    result: { point },
  } = await getGeocode(address);

  return {
    latitude: parseFloat(point.y),
    longitude: parseFloat(point.x),
  };
};

const parseCoordinate = async (
  latitudeFieldName: string,
  longitudeFieldName: string,
  epsg: string,
  data: Record<string, unknown>
) => {
  const latitude = Number(data[latitudeFieldName]);
  const longitude = Number(data[longitudeFieldName]);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  if (epsg === "EPSG:4326") {
    return {
      latitude,
      longitude,
    };
  }

  const transformer = transform(epsg, "4326");
  const [transformedLongitude, transformedLatitude] =
    transformer.forward([latitude, longitude]);
  return {
    latitude: transformedLatitude,
    longitude: transformedLongitude,
  };
};

export const OpenDataViewer = async ({
  searchParams,
}: {
  searchParams: MainPageSearchParamsWithServiceName;
}) => {
  const coordinateResolver =
    searchParams.fieldType === "address"
      ? geocodeAddress.bind(
          null,
          searchParams.addressFieldName
        )
      : parseCoordinate.bind(
          null,
          searchParams.latitudeFieldName,
          searchParams.longitudeFieldName,
          decodeURIComponent(searchParams.epsg)
        );

  const data = await getResolvedData({
    coordinateResolver,
    searchParams,
  });

  const fieldNameMap: Record<string, string> =
    parseFieldNameMap(searchParams.fieldNameMapString);

  const fieldNameMapReverse = Object.fromEntries(
    Object.entries(fieldNameMap).map(([key, value]) => [
      value,
      key,
    ])
  );

  const dataWithKoreanFieldName = data.map((row) => {
    const newRow: POIData = {
      coordinate: row.coordinate,
    };

    Object.entries(row).forEach(([key, value]) => {
      newRow[fieldNameMap[key] ?? key] = value;
    });

    return newRow;
  });

  const dataWithCoordinate = dataWithKoreanFieldName.filter(
    isResolvedPOIData
  );

  const pickDataKey = async (formData: FormData) => {
    "use server";

    const dataKeyPick = formData.getAll("data-key-pick");

    if (!dataKeyPick.length) {
      return null;
    }

    const paramString = new URLSearchParams(
      omit(searchParams, ["dataKeyPick"] as const)
    );

    dataKeyPick.forEach((dataKey) => {
      if (typeof dataKey !== "string") {
        return;
      }

      paramString.append("dataKeyPick", dataKey);
    });

    return redirect(`/?${paramString}`);
  };

  return (
    <div>
      {!!dataWithCoordinate.length && (
        <>
          <form
            className="overflow-x-scroll"
            action={pickDataKey}
          >
            {Object.entries(dataWithCoordinate[0])
              .filter(([key]) => key !== "coordinate")
              .map(([key, sampleValue]) => {
                const originalKey =
                  fieldNameMapReverse[key] ?? key;

                return (
                  <label
                    key={originalKey}
                    className="block"
                  >
                    <input
                      type="checkbox"
                      name="data-key-pick"
                      value={originalKey}
                      defaultChecked={searchParams.dataKeyPick?.includes(
                        originalKey
                      )}
                    />
                    {key} ({typeof sampleValue}), 샘플
                    데이터: {JSON.stringify(sampleValue)}
                  </label>
                );
              })}
            <button type="submit">선택</button>
          </form>
          <div>데이터 수: {dataWithCoordinate.length}</div>
          <div className="w-full h-[80vh]">
            <KakaoMap
              data={dataWithCoordinate}
              dataKeyPick={searchParams.dataKeyPick?.map(
                (key) => fieldNameMap[key] ?? key
              )}
            />
          </div>
        </>
      )}
    </div>
  );
};
