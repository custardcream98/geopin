import { getOpenDataSeoulSample } from "@/utils/openData/seoul/seoul.server";
import { OpenDataGeoFieldSelectForm } from "./OpenDataGeoFieldSelectForm";

import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import { getChatCompletion } from "@/utils/openai/openai.server";
import {
  getPickGeoFieldPrompt,
  getPickImportantFieldNamesPrompt,
} from "@/utils/openai/prompt";
import { omit } from "@/utils/object";
import { redirect } from "next/navigation";

const pickGeoFieldName = async ({
  sampleData,
}: {
  sampleData: Record<string, unknown>;
}) => {
  while (true) {
    const picked = (
      await getChatCompletion(
        getPickGeoFieldPrompt(sampleData)
      )
    )?.split(", ");

    if (picked?.length === 1 || picked?.length === 2) {
      const isAllValid = picked.every(
        (fieldName) => fieldName in sampleData
      );

      if (isAllValid) {
        return picked;
      }
    }
  }
};

const pickImportantFieldNames = async ({
  serviceName,
  sampleData,
}: {
  serviceName: string;
  sampleData: Record<string, unknown>;
}) => {
  while (true) {
    const picked = JSON.parse(
      (await getChatCompletion(
        getPickImportantFieldNamesPrompt({
          serviceName,
          sampleData,
        })
      )) ?? "[]"
    ) as string[];

    if (picked.length > 0) {
      const isAllValid = picked.every(
        (fieldName) => fieldName in sampleData
      );

      if (isAllValid) {
        return picked;
      }
    }
  }
};

export const OpenDataSampleViewer = async ({
  searchParams,
}: {
  searchParams: Partial<MainPageSearchParamsWithServiceName> & {
    serviceName: string;
  };
}) => {
  if (searchParams.fieldType) {
    return null;
  }

  const data = await getOpenDataSeoulSample({
    serviceName: searchParams.serviceName,
  });

  const sampleRow = data.row[0];

  const pickedGeoFieldName = await pickGeoFieldName({
    sampleData: sampleRow,
  });

  const pickedImportantFieldName =
    await pickImportantFieldNames({
      serviceName: searchParams.serviceName,
      sampleData: sampleRow,
    });

  if (pickedGeoFieldName?.length === 1) {
    const newSearchParams = new URLSearchParams({
      ...omit(searchParams, ["dataKeyPick"]),
      fieldType: "address",
      addressFieldName: pickedGeoFieldName[0],
    });

    pickedImportantFieldName.forEach((fieldName) =>
      newSearchParams.append("dataKeyPick", fieldName)
    );

    return redirect(`/?${newSearchParams}`);
  }

  if (pickedGeoFieldName?.length === 2) {
    const newSearchParams = new URLSearchParams({
      ...omit(searchParams, ["dataKeyPick"]),
      fieldType: "coordinate",
      latitudeFieldName: pickedGeoFieldName[0],
      longitudeFieldName: pickedGeoFieldName[1],
    });

    pickedImportantFieldName.forEach((fieldName) =>
      newSearchParams.append("dataKeyPick", fieldName)
    );

    return redirect(`/?${newSearchParams}`);
  }

  return (
    <div className="w-full">
      <details className="mb-4">
        <summary>Sample 응답값 확인하기</summary>
        <pre className="overflow-auto">
          {JSON.stringify(sampleRow, null, 2)}
        </pre>
      </details>
      {pickedGeoFieldName?.length !== 2 && (
        <OpenDataGeoFieldSelectForm
          searchParams={searchParams}
          data={sampleRow}
        />
      )}
    </div>
  );
};
