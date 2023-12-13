"use server";

import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import { omit } from "@/utils/object";
import { redirect } from "next/navigation";

export const pickDataKey = async (
  searchParams: MainPageSearchParamsWithServiceName,
  formData: FormData
) => {
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
