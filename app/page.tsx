import { ServiceSearchForm } from "@/components/ServiceSearchForm.server";
import AuthButton from "../components/AuthButton";
import { OpenDataViewer } from "@/components/OpenDataViewer.server";
import { OpenDataSampleViewer } from "@/components/OpenDataSampleViewer.server";
import { ErrorMessageToast } from "@/components/ErrorMessageToast";
import { GeoFieldType } from "@/types/field";
import { OpenDataTitleViewer } from "@/components/OpenDataTitleViewer.server";

type AddressSearchParams = {
  fieldType: "address";
  addressFieldName: string;
};

type CoordinateSearchParams = {
  fieldType: "coordinate";
  latitudeFieldName: string;
  longitudeFieldName: string;
};

type MainPageSearchParams = {
  serviceName?: string;
  serviceNameKorean?: string;
  errorId?: string;
  fieldType?: GeoFieldType;
} & (AddressSearchParams | CoordinateSearchParams);

export default async function MainPage({
  searchParams,
}: {
  searchParams?: MainPageSearchParams;
}) {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <AuthButton />
        </div>
      </nav>
      <ServiceSearchForm />
      {searchParams && (
        <>
          {searchParams.serviceNameKorean && (
            <OpenDataTitleViewer>
              {searchParams.serviceNameKorean}
            </OpenDataTitleViewer>
          )}
          {searchParams.serviceName && (
            <>
              <OpenDataSampleViewer
                serviceName={searchParams.serviceName}
              />
              {(searchParams.fieldType === "address" ||
                searchParams.fieldType ===
                  "coordinate") && (
                <OpenDataViewer
                  serviceName={searchParams.serviceName}
                  {...searchParams}
                />
              )}
            </>
          )}
          {searchParams.errorId && (
            <ErrorMessageToast
              errorId={searchParams.errorId}
            />
          )}
        </>
      )}
    </div>
  );
}
