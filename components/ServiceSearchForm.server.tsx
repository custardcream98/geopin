import { redirect } from "next/navigation";
import { parse } from "node-html-parser";
import { ErrorId } from "./ErrorMessageToast/ErrorMessageToast.type";

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

      if (tdElement.text === "서비스명") {
        serviceNameFlag = true;
      }
    }
  }

  throw new Error("No service name found");
};

export const ServiceSearchForm = () => {
  const getSeoulOpenData = async (formData: FormData) => {
    "use server";

    const url = formData.get("target-url") as string;

    const segments = url.split("/");
    const informationId =
      segments[segments.indexOf("dataList") + 1];

    const sampleDataUrl = `${
      process.env.OPEN_DATA_SEOUL_SERVICE_URL
    }/dataList/openApiView.do?${new URLSearchParams({
      infId: informationId,
      srvType: "A",
    })}`;

    const response = await fetch(sampleDataUrl);

    if (!response.ok) {
      return redirect(
        `/?${new URLSearchParams({
          errorId:
            ErrorId.FailedToFetchOpenDataSeoulSample.toString(),
        })}`
      );
    }

    const rawHTML = await response.text();

    let serviceName: string;
    try {
      serviceName = findServiceName(rawHTML);
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
      `/?${new URLSearchParams({ serviceName })}`
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
