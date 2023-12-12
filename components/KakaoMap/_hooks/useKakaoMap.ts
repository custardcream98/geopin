import { useEffect, useState } from "react";

const KAKAO_MAP_SCRIPT_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_DEVELOPERS_KEY}&autoload=false`;

const KAKAO_MAP_SCRIPT_ID = "kakao-map-script";

export const useKakaoMap = (
  mapContainerElementRef: React.RefObject<HTMLElement>
) => {
  const [kakaoMap, setKakaoMap] = useState<any>(null);

  useEffect(() => {
    const mapContainerElement =
      mapContainerElementRef.current;
    if (window === undefined || !mapContainerElement) {
      return;
    }

    const initializeKakaoMap = () => {
      const center = new kakao.maps.LatLng(
        37.50802,
        127.062835
      );
      const options = {
        center,
        level: 3,
      };
      const map = new kakao.maps.Map(
        mapContainerElementRef.current,
        options
      );
      setKakaoMap(map);
    };

    const kakaoMapScriptElement = document.getElementById(
      KAKAO_MAP_SCRIPT_ID
    );
    if (kakaoMapScriptElement) {
      kakaoMapScriptElement.onload = () => {
        kakao.maps.load(() => initializeKakaoMap());
      };
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.src = KAKAO_MAP_SCRIPT_URL;
    document.head.appendChild(script);

    script.onload = () => {
      kakao.maps.load(() => initializeKakaoMap());
    };
  }, []);

  return kakaoMap;
};
