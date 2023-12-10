import { getOpenDataSeoulSample } from "@/utils/openData/seoul/seoul.server";
import { OpenDataGeoFieldSelectForm } from "./OpenDataGeoFieldSelectForm";

export const OpenDataSampleViewer = async ({
  serviceName,
}: {
  serviceName: string;
}) => {
  const data = await getOpenDataSeoulSample({
    serviceName,
  });

  const sampleRow = data.row[0];

  return (
    <div className="w-10/12 mx-auto">
      <details className="mb-4">
        <summary>Sample 응답값 확인하기</summary>
        <pre className="overflow-auto">
          {JSON.stringify(sampleRow, null, 2)}
        </pre>
      </details>
      <OpenDataGeoFieldSelectForm
        serviceName={serviceName}
        data={sampleRow}
      />
    </div>
  );
};
