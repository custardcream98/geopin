"use server";

import { redirect } from "next/navigation";
import { ErrorId } from "../ErrorMessageToast/ErrorMessageToast.type";
import type { GeoFieldType } from "@/types/field";
import { isAddress } from "@/utils/validation/isAddress";

const isString = (value: unknown): value is string =>
  typeof value === "string";

const isValidLongitude = (value: number) =>
  value >= -180 && value <= 180;

const isValidLatitude = (value: number) =>
  value >= -90 && value <= 90;

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
  serviceName: string,
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
        serviceName,
        ErrorId.InvalidAddressField
      );
    }

    return redirectWithValidField(
      serviceName,
      "address",
      addressField
    );
  }

  if (longitudeField === latitudeField) {
    return redirectWithErrorId(
      serviceName,
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
    sampleLongitude && isValidLongitude(parsedLongitude);

  const isValidLatitudeField =
    sampleLatitude && isValidLatitude(parsedLatitude);

  if (!isValidLongitudeField && !isValidLatitudeField) {
    return redirectWithErrorId(
      serviceName,
      ErrorId.InvalidCoordinateFields
    );
  }

  if (!isValidLongitudeField) {
    return redirectWithErrorId(
      serviceName,
      ErrorId.InvalidLongitudeField
    );
  }

  if (!isValidLatitudeField) {
    return redirectWithErrorId(
      serviceName,
      ErrorId.InvalidLatitudeField
    );
  }

  return redirectWithValidField(
    serviceName,
    "coordinate",
    longitudeField,
    latitudeField
  );
};
