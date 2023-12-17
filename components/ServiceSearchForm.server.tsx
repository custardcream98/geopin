import { redirect } from "next/navigation";
import { parse } from "node-html-parser";

import { ErrorId } from "./ErrorMessageToast/ErrorMessageToast.type";
import { stringifyFieldNameMap } from "./_utils/fieldNameMap";
import { encode } from "@/utils/crypto";
import type { MainPageSearchParams } from "@/app/page";

const getSampleDataResponse = async (
  informationId: string
) => {
  const sampleDataUrl = `${
    process.env.OPEN_DATA_SEOUL_SERVICE_URL
  }/dataList/openApiView.do?${new URLSearchParams({
    infId: informationId,
    srvType: "A",
  })}`;

  const response = await fetch(sampleDataUrl);

  return response;
};

const findServiceName = (rawHTML: string) => {
  const parsedSamplePage = parse(rawHTML);

  const tableRowElementList =
    parsedSamplePage.querySelectorAll("table > tbody > tr");

  for (const trElement of tableRowElementList) {
    const tableDataElementList =
      trElement.querySelectorAll("td");

    let serviceNameFlag = false;
    for (const tdElement of tableDataElementList) {
      if (serviceNameFlag) {
        return tdElement.textContent;
      }

      if (tdElement.textContent.trim() === "서비스명") {
        serviceNameFlag = true;
      }
    }
  }

  throw new Error("No service name found");
};

const findServiceNameKorean = (rawHTML: string) => {
  const parsedTargetPage = parse(rawHTML);

  const titleElement = parsedTargetPage.querySelector(
    "h1.main-content-tit"
  );

  if (!titleElement) {
    throw new Error("No service title found");
  }

  return encode(titleElement.textContent.trim());
};

const findFieldNameMap = (rawHTML: string) => {
  const parsedTargetPage = parse(rawHTML);

  const outputTableTitle = parsedTargetPage
    .querySelectorAll("caption")
    .find(
      (element) => element.textContent.trim() === "출력값"
    );
  if (!outputTableTitle) {
    return;
  }

  const tableElement = outputTableTitle.parentNode;
  let fieldNameMap: Record<string, string> = {};
  tableElement
    .querySelectorAll("tbody > tr")
    .forEach((tableRowElement) => {
      const tableDataElements =
        tableRowElement.querySelectorAll("td");

      if (
        tableDataElements[0]?.textContent.trim() === "공통"
      ) {
        return;
      }

      const key = tableDataElements[1]?.textContent;
      const value = tableDataElements[2]?.textContent;

      if (!key || !value) {
        return;
      }

      fieldNameMap[key] = value;
    });

  return fieldNameMap;
};

const findEPSG = (rawHTML: string) => {
  const match = rawHTML.match(/EPSG:[0-9]{4,}/)?.[0];

  if (!match) {
    return;
  }

  return match;
};

export const ServiceSearchForm = ({
  searchParams,
}: {
  searchParams?: MainPageSearchParams;
}) => {
  const getSeoulOpenData = async (formData: FormData) => {
    "use server";

    const url = formData.get("target-url") as string;
    const encodedUrl = encodeURIComponent(url);

    const segments = url.split("/");
    const informationId =
      segments[segments.indexOf("dataList") + 1];

    const sampleDataResponse = await getSampleDataResponse(
      informationId
    );

    const targetPageResponse = await fetch(url);

    if (!sampleDataResponse.ok || !targetPageResponse.ok) {
      return redirect(
        `/?${new URLSearchParams({
          targetUrl: encodedUrl,
          errorId:
            ErrorId.FailedToFetchOpenDataSeoulSample.toString(),
        })}`
      );
    }

    const sampleDataRawHTML =
      await sampleDataResponse.text();
    const targetPageRawHTML =
      await targetPageResponse.text();

    let serviceName: string;
    let serviceNameKorean: string;
    let fieldNameMapString: string; // stringify 후 paramString에 붙여서 redirect
    let epsg: string;
    try {
      serviceName = findServiceName(sampleDataRawHTML);
      serviceNameKorean = findServiceNameKorean(
        targetPageRawHTML
      );
      fieldNameMapString = stringifyFieldNameMap(
        findFieldNameMap(sampleDataRawHTML)
      );
      epsg = findEPSG(targetPageRawHTML) ?? "EPSG:4326";
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        error.message === "No service name found"
      ) {
        return redirect(
          `/?${new URLSearchParams({
            errorId:
              ErrorId.FailedToFindOpenDataSeoulServiceName.toString(),
          })}`
        );
      }

      console.error(error);

      return redirect(
        `/?${new URLSearchParams({
          targetUrl: encodedUrl,
          errorId: "999",
        })}`
      );
    }

    return redirect(
      `/?${new URLSearchParams({
        targetUrl: encodedUrl,
        serviceName,
        serviceNameKorean,
        fieldNameMapString,
        epsg,
      })}`
    );
  };

  return (
    <div className="w-full">
      <form action={getSeoulOpenData} className="w-full">
        <label
          htmlFor="target-url"
          className="block text-center"
        >
          서울시 공공데이터 URL을 입력해주세요.
        </label>
        <input
          type="text"
          id="target-url"
          name="target-url"
          defaultValue={
            searchParams?.targetUrl
              ? decodeURIComponent(searchParams.targetUrl)
              : undefined
          }
          autoSave="off"
          className="mx-2 p-2 border rounded block w-full mt-2"
          required
        />
        <button
          type="submit"
          className="mx-2 p-2 shadow rounded block w-full mt-2"
        >
          불러오기
        </button>
      </form>
    </div>
  );
};
