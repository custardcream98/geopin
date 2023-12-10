import type { GeoFieldType } from "@/types/field";
import { getOpenDataSeoul } from "@/utils/openData/seoul/seoul.server";
import { getGeocode } from "@/utils/vworld/geocode.server";

const getResolvedData = async ({
  serviceName,
  coordinateResolver,
}: {
  serviceName: string;
  coordinateResolver: (
    data: Record<string, unknown>
  ) => Promise<{
    latitude: number;
    longitude: number;
  } | null>;
}) => {
  const data = (await getOpenDataSeoul({ serviceName }))
    .row;

  return Promise.all(
    data.map(async (row) => {
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
  data: Record<string, unknown>
) => {
  const latitude = Number(data[latitudeFieldName]);
  const longitude = Number(data[longitudeFieldName]);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
};

export const OpenDataViewer = async ({
  serviceName,
  ...props
}: {
  serviceName: string;
  fieldType?: GeoFieldType;
} & (
  | {
      fieldType: "address";
      addressFieldName: string;
    }
  | {
      fieldType: "coordinate";
      latitudeFieldName: string;
      longitudeFieldName: string;
    }
)) => {
  const coordinateResolver =
    props.fieldType === "address"
      ? geocodeAddress.bind(null, props.addressFieldName)
      : parseCoordinate.bind(
          null,
          props.latitudeFieldName,
          props.longitudeFieldName
        );

  const data = await getResolvedData({
    serviceName,
    coordinateResolver,
  });

  return (
    <pre className="w-10/12 mx-auto overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};
