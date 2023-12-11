import { redirect } from "next/navigation";
import { parse } from "node-html-parser";
import { ErrorId } from "./ErrorMessageToast/ErrorMessageToast.type";

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

      if (tdElement.textContent === "서비스명") {
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

  return titleElement.textContent;
};

export const ServiceSearchForm = () => {
  const getSeoulOpenData = async (formData: FormData) => {
    "use server";

    const url = formData.get("target-url") as string;

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
    try {
      serviceName = findServiceName(sampleDataRawHTML);
      serviceNameKorean = findServiceNameKorean(
        targetPageRawHTML
      );
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
          errorId: "999",
        })}`
      );
    }

    return redirect(
      `/?${new URLSearchParams({
        serviceName,
        serviceNameKorean,
      })}`
    );
  };

  return (
    <div>
      <form action={getSeoulOpenData}>
        <label htmlFor="target-url">공공데이터 URL</label>
        <input
          type="text"
          id="target-url"
          name="target-url"
          required
          pattern="(?:http[s]{0,1}\:\/\/)data\.seoul\.go\.kr\/dataList\/[0-9A-Za-z\/]{4,}"
          className="invalid:bg-red-200 bg-green-200"
          autoSave="off"
        />
        <button type="submit">불러오기</button>
      </form>
    </div>
  );
};
