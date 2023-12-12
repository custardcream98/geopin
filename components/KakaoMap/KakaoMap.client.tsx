"use client";

import { useEffect, useRef } from "react";

import type { ResolvedPOIData } from "@/types/data";

import MarkerImage from "@/assets/marker.png";
import { useKakaoMap } from "./_hooks";

const MARKER_SIZE = 30;

const generateOverlayContent = (
  data: ResolvedPOIData,
  dataKeyPick?: string[]
) =>
  !!dataKeyPick?.length &&
  `
  <div class="flex justify-center items-center mb-9">
    <ul class="w-[200px] p-2 rounded shadow text-sm bg-white">
      ${Object.entries(data)
        .filter(
          ([key]) =>
            !dataKeyPick || dataKeyPick.includes(key)
        )
        .map(
          ([key, value]) =>
            `<li class="w-full">${key}: ${value}</li>`
        )
        .join("")}
    </ul>
  </div>
`;

export const KakaoMap = ({
  data,
  dataKeyPick,
}: {
  data: ResolvedPOIData[];
  dataKeyPick?: string[];
}) => {
  const mapContainerElementRef =
    useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
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

    overlaysRef.current.forEach((overlay) =>
      overlay.setMap(null)
    );
    const overlays = positions.map(
      (position, index) =>
        new kakaoMaps.CustomOverlay({
          map: kakaoMap,
          position,
          content: generateOverlayContent(
            data[index],
            dataKeyPick
          ),
          yAnchor: 1,
          zIndex: 1,
        })
    );
    overlaysRef.current = overlays;

    if (positions.length > 0) {
      const bounds = positions.reduce(
        (bounds, coordinate) => bounds.extend(coordinate),
        new kakaoMaps.LatLngBounds()
      );

      kakaoMap.setBounds(bounds);
    }
  }, [kakaoMap, data, dataKeyPick]);

  return (
    <div
      ref={mapContainerElementRef}
      className="w-full h-full"
    >
      {!kakaoMap && (
        <div className="w-full h-full flex justify-center items-center">
          <p>지도를 불러오는 중입니다.</p>
        </div>
      )}
    </div>
  );
};
