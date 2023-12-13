import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import type { POIData } from "@/types/data";
import { transform } from "@/utils/epsg/transform";
import { getOpenDataSeoul } from "@/utils/openData/seoul/seoul.server";
import { getGeocode } from "@/utils/vworld/geocode.server";
import { NextResponse } from "next/server";

type FieldData =
  | {
      fieldType: "address";
      addressFieldName: string;
    }
  | {
      fieldType: "coordinate";
      latitudeFieldName: string;
      longitudeFieldName: string;
      epsg: string;
    };

const getResolvedData = async ({
  coordinateResolver,
  startIndex,
  endIndex,
  serviceName,
  ...fieldData
}: {
  coordinateResolver: (
    data: Record<string, unknown>
  ) => Promise<{
    latitude: number;
    longitude: number;
  } | null>;
  startIndex: number;
  endIndex: number;
  serviceName: string;
} & FieldData): Promise<{
  totalCount: number;
  data: POIData[];
}> => {
  const data = await getOpenDataSeoul({
    serviceName,
    startIndex,
    endIndex,
  });

  const filterDuplicateData = (
    data: Record<string, unknown>[]
  ) => {
    if (fieldData.fieldType === "address") {
      const addressFieldName = fieldData.addressFieldName;

      return data.filter(
        (row, index, array) =>
          array.findIndex(
            (row2) =>
              row[addressFieldName] ===
              row2[addressFieldName]
          ) === index
      );
    }

    const latitudeFieldName = fieldData.latitudeFieldName;
    const longitudeFieldName = fieldData.longitudeFieldName;

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

  return {
    totalCount: data.list_total_count,
    data: await Promise.all(
      filterDuplicateData(data.row).map(async (row) => {
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
    ),
  };
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

const isAddressFieldData = (
  fieldData: Record<string, unknown>
): fieldData is {
  fieldType: "address";
  addressFieldName: string;
} =>
  fieldData.fieldType === "address" &&
  !!fieldData.addressFieldName;

const isCoordinateFieldData = (
  fieldData: Record<string, unknown>
): fieldData is {
  fieldType: "coordinate";
  latitudeFieldName: string;
  longitudeFieldName: string;
  epsg: string;
} =>
  fieldData.fieldType === "coordinate" &&
  !!fieldData.latitudeFieldName &&
  !!fieldData.longitudeFieldName &&
  !!fieldData.epsg;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const serviceName =
    requestUrl.searchParams.get("serviceName");
  const start = Number(
    requestUrl.searchParams.get("start")
  );
  const end = Number(requestUrl.searchParams.get("end"));
  const fieldType =
    requestUrl.searchParams.get("fieldType");
  const addressFieldName = requestUrl.searchParams.get(
    "addressFieldName"
  );
  const latitudeFieldName = requestUrl.searchParams.get(
    "latitudeFieldName"
  );
  const longitudeFieldName = requestUrl.searchParams.get(
    "longitudeFieldName"
  );
  const epsg = requestUrl.searchParams.get("epsg");

  const unresolvedFieldData = {
    fieldType,
    addressFieldName,
    latitudeFieldName,
    longitudeFieldName,
    epsg,
  };

  if (
    !serviceName ||
    isNaN(start) ||
    isNaN(end) ||
    !unresolvedFieldData.fieldType ||
    !["address", "coordinate"].includes(
      unresolvedFieldData.fieldType
    ) ||
    !(
      isAddressFieldData(unresolvedFieldData) ||
      isCoordinateFieldData(unresolvedFieldData)
    )
  ) {
    return NextResponse.json(
      {
        message: "Invalid parameters",
      },
      { status: 400 }
    );
  }

  const data = await getOpenDataSeoul({
    serviceName,
    startIndex: start,
    endIndex: end,
  });

  const coordinateResolver =
    unresolvedFieldData.fieldType === "address"
      ? geocodeAddress.bind(
          null,
          decodeURIComponent(
            unresolvedFieldData.addressFieldName ?? ""
          )
        )
      : parseCoordinate.bind(
          null,
          decodeURIComponent(
            unresolvedFieldData.latitudeFieldName ?? ""
          ),
          decodeURIComponent(
            unresolvedFieldData.longitudeFieldName ?? ""
          ),
          decodeURIComponent(unresolvedFieldData.epsg ?? "")
        );

  return NextResponse.json(
    await getResolvedData({
      coordinateResolver,
      startIndex: start,
      endIndex: end,
      serviceName,
      ...unresolvedFieldData,
    })
  );
}
