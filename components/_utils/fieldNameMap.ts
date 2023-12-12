import { decode, encode } from "@/utils/crypto";

export const parseFieldNameMap = (
  fieldNameMapString?: string
): Record<string, string> => {
  const decodedFieldNameMapString = fieldNameMapString
    ? decode(fieldNameMapString)
    : "{}";

  return JSON.parse(
    !!decodedFieldNameMapString &&
      decodedFieldNameMapString !== "undefined"
      ? decodedFieldNameMapString
      : "{}"
  );
};

export const stringifyFieldNameMap = (
  fieldNameMap?: Record<string, string>
): string => {
  return encode(JSON.stringify(fieldNameMap));
};
