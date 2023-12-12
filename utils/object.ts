export const omit = <T extends Record<string, unknown>>(
  object: T,
  keys: ReadonlyArray<keyof T>
): Omit<T, (typeof keys)[number]> => {
  const newObject = { ...object };
  keys.forEach((key) => delete newObject[key]);
  return newObject;
};
