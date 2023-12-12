"use server";

import { redirect } from "next/navigation";
import { ErrorId } from "../ErrorMessageToast/ErrorMessageToast.type";
import type { GeoFieldType } from "@/types/field";
import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import { isAddress } from "@/utils/validation/isAddress";

const isString = (value: unknown): value is string =>
  typeof value === "string";

const redirectWithErrorId = (
  serviceName: string,
  errorId: ErrorId
) =>
  redirect(
    `/?${new URLSearchParams({
      serviceName,
      errorId: errorId.toString(),
    })}`
  );

function redirectWithValidField(
  serviceName: string,
  fieldType: "address",
  addressFieldName: string
): void;
function redirectWithValidField(
  serviceName: string,
  fieldType: "coordinate",
  longitudeFieldName: string,
  latitudeFieldName: string
): void;
function redirectWithValidField(
  serviceName: string,
  fieldType: GeoFieldType,
  ...fieldNames: string[]
) {
  if (fieldType === "address") {
    const [addressFieldName] = fieldNames;

    return redirect(
      `/?${new URLSearchParams({
        serviceName,
        fieldType,
        addressFieldName,
      })}`
    );
  } else {
    const [longitudeFieldName, latitudeFieldName] =
      fieldNames;

    return redirect(
      `/?${new URLSearchParams({
        serviceName,
        fieldType,
        longitudeFieldName,
        latitudeFieldName,
      })}`
    );
  }
}

export const redirectToFetchData = async (
  sampleDataForValidation: Record<string, unknown>,
  searchParams: MainPageSearchParamsWithServiceName,
  formData: FormData
) => {
  const addressField = formData.get("addressField");
  const longitudeField = formData.get("longitudeField");
  const latitudeField = formData.get("latitudeField");

  if (isString(addressField)) {
    const sampleAddress =
      sampleDataForValidation[addressField];
    const isValidAddress =
      isString(sampleAddress) && isAddress(sampleAddress);

    if (!isValidAddress) {
      return redirectWithErrorId(
        searchParams.serviceName,
        ErrorId.InvalidAddressField
      );
    }

    return redirect(
      `/?${new URLSearchParams({
        serviceName: searchParams.serviceName,
        fieldType: "address",
        addressFieldName: addressField,
        epsg: searchParams.epsg,
        fieldNameMapString:
          searchParams.fieldNameMapString!,
        serviceNameKorean: searchParams.serviceNameKorean!,
      })}`
    );
  }

  if (longitudeField === latitudeField) {
    return redirectWithErrorId(
      searchParams.serviceName,
      ErrorId.SameCoordinateFieldNames
    );
  }

  const sampleLongitude =
    isString(longitudeField) &&
    sampleDataForValidation[longitudeField];
  const sampleLatitude =
    isString(latitudeField) &&
    sampleDataForValidation[latitudeField];

  const parsedLongitude = Number(sampleLongitude);
  const parsedLatitude = Number(sampleLatitude);

  const isValidLongitudeField =
    sampleLongitude && !isNaN(parsedLongitude);

  const isValidLatitudeField =
    sampleLatitude && !isNaN(parsedLatitude);

  if (!isValidLongitudeField && !isValidLatitudeField) {
    return redirectWithErrorId(
      searchParams.serviceName,
      ErrorId.InvalidCoordinateFields
    );
  }

  if (!isValidLongitudeField) {
    return redirectWithErrorId(
      searchParams.serviceName,
      ErrorId.InvalidLongitudeField
    );
  }

  if (!isValidLatitudeField) {
    return redirectWithErrorId(
      searchParams.serviceName,
      ErrorId.InvalidLatitudeField
    );
  }

  return redirect(
    `/?${new URLSearchParams({
      serviceName: searchParams.serviceName,
      fieldType: "coordinate",
      longitudeFieldName: longitudeField,
      latitudeFieldName: latitudeField,
      epsg: searchParams.epsg,
      fieldNameMapString: searchParams.fieldNameMapString!,
      serviceNameKorean: searchParams.serviceNameKorean!,
    })}`
  );
};
