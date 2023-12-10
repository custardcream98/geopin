export const fetchData = async <T>(
  input: RequestInfo,
  init?: RequestInit
) => {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`Fetch on ${input} failed`);
  }

  const data = (await response.json()) as T;
  return data;
};
