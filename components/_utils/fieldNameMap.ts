export const parseFieldNameMap = (
  fieldNameMapString?: string
): Record<string, string> => {
  const decodedFieldNameMapString = decodeURIComponent(
    fieldNameMapString ?? "{}"
  );

  return JSON.parse(
    !!decodedFieldNameMapString &&
      decodedFieldNameMapString !== "undefined"
      ? decodedFieldNameMapString
      : "{}"
  );
};
