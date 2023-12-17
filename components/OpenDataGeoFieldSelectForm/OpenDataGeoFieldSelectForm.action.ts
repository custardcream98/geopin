"use server";

import { redirect } from "next/navigation";
import { isAddress } from "@/utils/validation/isAddress";
import { omit } from "@/utils/object";

import { ErrorId } from "../ErrorMessageToast/ErrorMessageToast.type";
import type { MainPageSearchParamsWithServiceName } from "@/app/page";

const isString = (value: unknown): value is string =>
  typeof value === "string";

const redirectWithErrorId = (
  searchParams: MainPageSearchParamsWithServiceName,
  errorId: ErrorId
) =>
  redirect(
    `/?${new URLSearchParams({
      ...omit(searchParams, ["dataKeyPick"]),
      errorId: errorId.toString(),
    })}`
  );

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
        searchParams,
        ErrorId.InvalidAddressField
      );
    }

    return redirect(
      `/?${new URLSearchParams({
        ...omit(searchParams, ["dataKeyPick"]),
        fieldType: "address",
        addressFieldName: addressField,
      })}`
    );
  }

  if (longitudeField === latitudeField) {
    return redirectWithErrorId(
      searchParams,
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
      searchParams,
      ErrorId.InvalidCoordinateFields
    );
  }

  if (!isValidLongitudeField) {
    return redirectWithErrorId(
      searchParams,
      ErrorId.InvalidLongitudeField
    );
  }

  if (!isValidLatitudeField) {
    return redirectWithErrorId(
      searchParams,
      ErrorId.InvalidLatitudeField
    );
  }

  return redirect(
    `/?${new URLSearchParams({
      ...omit(searchParams, ["dataKeyPick"]),
      fieldType: "coordinate",
      longitudeFieldName: longitudeField,
      latitudeFieldName: latitudeField,
    })}`
  );
};
