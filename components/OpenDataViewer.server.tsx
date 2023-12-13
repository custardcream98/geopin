import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import { parseFieldNameMap } from "./_utils/fieldNameMap";
import { DataViewer } from "./DataViewer/DataViewer.client";
import { DataViewerProvider } from "./DataViewer/DataViewer.context";

export const OpenDataViewer = async ({
  searchParams,
}: {
  searchParams: MainPageSearchParamsWithServiceName;
}) => {
  const fieldNameMap: Record<string, string> =
    parseFieldNameMap(searchParams.fieldNameMapString);

  const fieldNameMapReverse = Object.fromEntries(
    Object.entries(fieldNameMap).map(([key, value]) => [
      value,
      key,
    ])
  );

  return (
    <div className="w-full">
      <DataViewerProvider>
        <DataViewer
          fieldNameMap={fieldNameMap}
          fieldNameMapReverse={fieldNameMapReverse}
          searchParams={searchParams}
        />
      </DataViewerProvider>
    </div>
  );
};
