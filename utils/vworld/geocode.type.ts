type AddressType = "ROAD" | "PARCEL";

export type VWorldGeocodeResponse = {
  response: {
    service: {
      name: string;
      version: string;
      operation: string;
      time: string;
    };
    status: "OK" | "NOT_FOUND" | "ERROR";
    input?: {
      type: AddressType;
      address: string;
    };
    refined?: {
      text: string;
      structure: {
        /** 국가 */
        level0: string;
        /** 시/도 */
        level1: string;
        /** 시/군/구 */
        level2: string;
        /** (일반구) 구 */
        level3: string;
        /** (도로)도로명, (지번)법정읍·면·동 명 */
        level4L: string;
        /** (도로)행정읍·면·동 명, (지번)지원안함 */
        level4A: string;
        /** (도로)행정읍·면·동 코드, (지번)지원안함 */
        level4AC: string;
        /** (도로)길, (지번)번지 */
        level5: string;
        /** 상세주소 */
        detail: string;
      };
    };
    result: {
      crs: string;
      point: {
        x: string;
        y: string;
      };
    };
  };
};
