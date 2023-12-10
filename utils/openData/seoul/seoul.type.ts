export type OpenDataSeoulResponse<T extends string> = {
  [key in T]: {
    list_total_count: number;
    RESULT: {
      CODE: string;
      MESSAGE: string;
    };
    row: Record<string, unknown>[];
  };
};
