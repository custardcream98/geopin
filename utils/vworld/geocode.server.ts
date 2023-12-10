import { fetchData } from "../fetch";
import { isAddress } from "../validation/isAddress";
import type { VWorldGeocodeResponse } from "./geocode.type";

export const getGeocode = async (
  address: string,
  type: "ROAD" | "PARCEL" = "ROAD"
): Promise<VWorldGeocodeResponse["response"]> => {
  if (!process.env.NEXT_PUBLIC_VWORLD_KEY) {
    throw new Error("VWORLD_KEY is not defined");
  }

  // check if address form is valid

  const isValidAddress = isAddress(address);

  if (!isValidAddress) {
    throw new Error("Invalid address");
  }

  try {
    const { response } =
      await fetchData<VWorldGeocodeResponse>(
        `${
          process.env.VWORLD_BASE_URL
        }/req/address?${new URLSearchParams({
          service: "address",
          request: "GetCoord",
          key: process.env.NEXT_PUBLIC_VWORLD_KEY,
          address,
          type,
        })}`
      );

    if (response.status !== "OK" && type === "ROAD") {
      const response = await getGeocode(address, "PARCEL");

      if (response.status !== "OK") {
        throw new Error("No result found");
      }

      return response;
    }

    return response;
  } catch (error) {
    if (type === "ROAD") {
      const response = await getGeocode(address, "PARCEL");

      if (response.status !== "OK") {
        throw new Error("No result found");
      }

      return response;
    }

    throw new Error("Failed to geocode");
  }
};
