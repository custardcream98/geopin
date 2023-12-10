import { fetchData } from "@/utils/fetch";
import type { OpenDataSeoulResponse } from "./seoul.type";

export const getOpenDataSeoul = async ({
  serviceName,
  startIndex = 1,
  endIndex = 10,
}: {
  serviceName: string;
  startIndex?: number;
  endIndex?: number;
}) => {
  const openDataSeoulApi = `${process.env.OPEN_DATA_SEOUL_BASE_URL}/${process.env.OPEN_DATA_SEOUL_API_KEY}/json/${serviceName}/${startIndex}/${endIndex}`;

  const response = await fetchData<
    OpenDataSeoulResponse<typeof serviceName>
  >(openDataSeoulApi);

  return response[serviceName];
};

export const getOpenDataSeoulSample = async ({
  serviceName,
}: {
  serviceName: string;
}) => {
  const openDataSeoulApi = `${process.env.OPEN_DATA_SEOUL_BASE_URL}/sample/json/${serviceName}/1/5`;

  const response = await fetchData<
    OpenDataSeoulResponse<typeof serviceName>
  >(openDataSeoulApi);

  return response[serviceName];
};
