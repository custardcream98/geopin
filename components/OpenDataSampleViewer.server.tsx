import { getOpenDataSeoulSample } from "@/utils/openData/seoul/seoul.server";
import { OpenDataGeoFieldSelectForm } from "./OpenDataGeoFieldSelectForm";

import type { MainPageSearchParamsWithServiceName } from "@/app/page";

export const OpenDataSampleViewer = async ({
  searchParams,
}: {
  searchParams: MainPageSearchParamsWithServiceName;
}) => {
  const data = await getOpenDataSeoulSample({
    serviceName: searchParams.serviceName,
  });

  const sampleRow = data.row[0];

  return (
    <div className="w-full">
      <details className="mb-4">
        <summary>Sample 응답값 확인하기</summary>
        <pre className="overflow-auto">
          {JSON.stringify(sampleRow, null, 2)}
        </pre>
      </details>
      <OpenDataGeoFieldSelectForm
        searchParams={searchParams}
        data={sampleRow}
      />
    </div>
  );
};
