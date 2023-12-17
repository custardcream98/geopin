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

  return (
    <div className="w-full">
      <DataViewerProvider>
        <DataViewer
          fieldNameMap={fieldNameMap}
          searchParams={searchParams}
        />
      </DataViewerProvider>
    </div>
  );
};
