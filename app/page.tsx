import { ServiceSearchForm } from "@/components/ServiceSearchForm.server";
import AuthButton from "../components/AuthButton";
import { OpenDataViewer } from "@/components/OpenDataViewer.server";
import { OpenDataSampleViewer } from "@/components/OpenDataSampleViewer.server";
import { ErrorMessageToast } from "@/components/ErrorMessageToast";
import { GeoFieldType } from "@/types/field";
import { OpenDataTitleViewer } from "@/components/OpenDataTitleViewer.server";
import { getAuth } from "@/utils/supabase/server";

type AddressSearchParams = {
  fieldType: "address";
  addressFieldName: string;
};

type CoordinateSearchParams = {
  fieldType: "coordinate";
  latitudeFieldName: string;
  longitudeFieldName: string;
};

export type MainPageSearchParams = {
  serviceName?: string;
  serviceNameKorean?: string;
  errorId?: string;
  fieldType?: GeoFieldType;
  dataKeyPick?: string[];
  fieldNameMapString?: string; // encoded JSON string
  epsg?: string;
} & (AddressSearchParams | CoordinateSearchParams);

export type MainPageSearchParamsWithServiceName =
  MainPageSearchParams &
    Required<
      Pick<MainPageSearchParams, "serviceName" | "epsg">
    >;

export default async function MainPage({
  searchParams,
}: {
  searchParams?: MainPageSearchParams;
}) {
  const auth = await getAuth();
  const isLogged = auth?.user !== null;

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <AuthButton />
        </div>
      </nav>
      {isLogged ? (
        <ServiceSearchForm />
      ) : (
        <div>로그인이 필요합니다.</div>
      )}
      {isLogged && searchParams && (
        <>
          {searchParams.serviceNameKorean && (
            <OpenDataTitleViewer>
              {searchParams.serviceNameKorean}
            </OpenDataTitleViewer>
          )}
          {searchParams.serviceName &&
            searchParams.epsg && (
              <>
                <OpenDataSampleViewer
                  searchParams={{
                    ...searchParams,
                    epsg: searchParams.epsg,
                    serviceName: searchParams.serviceName,
                  }}
                />
                {(searchParams.fieldType === "address" ||
                  searchParams.fieldType ===
                    "coordinate") && (
                  <OpenDataViewer
                    searchParams={{
                      ...searchParams,
                      epsg: searchParams.epsg,
                      serviceName: searchParams.serviceName,
                    }}
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
