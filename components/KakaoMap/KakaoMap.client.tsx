"use client";

import { useEffect, useRef } from "react";

import type { ResolvedPOIData } from "@/types/data";

import MarkerImage from "@/assets/marker.png";
import { useKakaoMap } from "./_hooks";

const MARKER_SIZE = 30;

export const KakaoMap = ({
  data,
}: {
  data: ResolvedPOIData[];
}) => {
  const mapContainerElementRef =
    useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const kakaoMap = useKakaoMap(mapContainerElementRef);

  useEffect(() => {
    if (!kakaoMap) {
      return;
    }
    const kakaoMaps = kakao.maps;

    const markerImage = new kakao.maps.MarkerImage(
      MarkerImage.src,
      new kakaoMaps.Size(MARKER_SIZE, MARKER_SIZE),
      kakaoMaps.Point(MARKER_SIZE / 2, MARKER_SIZE)
    );

    const positions = data.map(
      ({ coordinate: { latitude, longitude } }) =>
        new kakaoMaps.LatLng(latitude, longitude)
    );

    markersRef.current.forEach((marker) =>
      marker.setMap(null)
    );
    const markers = positions.map(
      (position) =>
        new kakaoMaps.Marker({
          map: kakaoMap,
          position,
          image: markerImage,
        })
    );
    markersRef.current = markers;

    if (positions.length > 0) {
      const bounds = positions.reduce(
        (bounds, coordinate) => bounds.extend(coordinate),
        new kakaoMaps.LatLngBounds()
      );

      kakaoMap.setBounds(bounds);
    }
  }, [kakaoMap, data]);

  return (
    <div
      ref={mapContainerElementRef}
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
