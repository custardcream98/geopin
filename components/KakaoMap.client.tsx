"use client";

import { useEffect, useRef, useState } from "react";

import type { ResolvedPOIData } from "@/types/data";

const KAKAO_MAP_SCRIPT_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_DEVELOPERS_KEY}&autoload=false`;

const KAKAO_MAP_SCRIPT_ID = "kakao-map-script";

export const KakaoMap = ({
  data,
}: {
  data: ResolvedPOIData[];
}) => {
  const mapContainerElement = useRef<HTMLDivElement>(null);
  const [kakaoMap, setKakaoMap] = useState<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (
      window === undefined ||
      document.getElementById(KAKAO_MAP_SCRIPT_ID)
    ) {
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.src = KAKAO_MAP_SCRIPT_URL;
    document.head.appendChild(script);

    script.onload = () => {
      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(
          37.50802,
          127.062835
        );
        const options = {
          center,
          level: 3,
        };
        const map = new kakao.maps.Map(
          mapContainerElement.current,
          options
        );
        setKakaoMap(map);
      });
    };
  }, []);

  useEffect(() => {
    if (kakaoMap === null) {
      return;
    }

    const positions = data.map(
      ({ coordinate: { latitude, longitude } }) =>
        new kakao.maps.LatLng(latitude, longitude)
    );

    markersRef.current.forEach((marker) =>
      marker.setMap(null)
    );
    const markers = positions.map(
      (position) =>
        new kakao.maps.Marker({ map: kakaoMap, position })
    );
    markersRef.current = markers;

    if (positions.length > 0) {
      const bounds = positions.reduce(
        (bounds, coordinate) => bounds.extend(coordinate),
        new kakao.maps.LatLngBounds()
      );

      kakaoMap.setBounds(bounds);
    }
  }, [kakaoMap, data]);

  return (
    <div
      ref={mapContainerElement}
      className="w-full flex-1"
    >
      {!kakaoMap && (
        <div className="w-full h-full flex justify-center items-center">
          <p>지도를 불러오는 중입니다.</p>
        </div>
      )}
    </div>
  );
};
