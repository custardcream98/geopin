import EPSG_CODES from "epsg-index/all.json";
import proj4 from "proj4";

const leadingEPSG = /^epsg:/i;

export const transform: any = (
  from: string,
  to: string
) => {
  if ("string" !== typeof from)
    throw new Error("from must be a string");
  from = from.replace(leadingEPSG, "");
  const fromEPSG = (EPSG_CODES as any)[from] as unknown as {
    proj4: string;
  };
  if (!fromEPSG)
    throw new Error(
      from + " is not a valid EPSG coordinate system"
    );

  if ("string" !== typeof to)
    throw new Error("to must be a string");
  to = to.replace(leadingEPSG, "");
  const toEPSG = (EPSG_CODES as any)[to] as unknown as {
    proj4: string;
  };
  if (!toEPSG)
    throw new Error(
      to + " is not a valid EPSG coordinate system"
    );

  return proj4(fromEPSG.proj4, toEPSG.proj4);
};
