"use client";

import { useEffect, useRef, useState } from "react";

import type { ResolvedPOIData } from "@/types/data";
import type { MainPageSearchParams } from "@/app/page";

import MarkerImage from "@/assets/marker.png";
import { useKakaoMap } from "./_hooks";

const MARKER_SIZE = 30;

const getOverlayId = (index: number) => `overlay-${index}`;
const generateOverlayContent = (
  index: number,
  data: ResolvedPOIData,
  fieldNameMap: Record<string, string>,
  dataKeyPick?: MainPageSearchParams["dataKeyPick"]
) => {
  const dataWithPickedKeys = Object.entries(data).filter(
    ([key]) =>
      dataKeyPick &&
      (typeof dataKeyPick === "string"
        ? dataKeyPick === key
        : dataKeyPick.includes(key))
  );

  if (dataWithPickedKeys.length === 0) {
    return "";
  }

  return `
  <div class="flex justify-center items-center mb-9 p-2 rounded shadow text-sm bg-white">
    <ul>
    ${dataWithPickedKeys
      .map(
        ([key, value]) =>
          `<li class="w-full">${
            fieldNameMap[key] ?? key
          }: ${value}</li>`
      )
      .join("")}
    </ul>
    <button id="${getOverlayId(
      index
    )}" type="button" class="float-right ml-2 font-bold">닫기</button>
  </div>
`;
};

export const KakaoMap = ({
  data,
  dataKeyPick,
  fieldNameMap,
}: {
  data: ResolvedPOIData[];
  dataKeyPick?: MainPageSearchParams["dataKeyPick"];
  fieldNameMap: Record<string, string>;
}) => {
  const mapContainerElementRef =
    useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  // const overlaysRef = useRef<any[]>([]);
  const [overlaysState, setOverlaysState] = useState<any[]>(
    []
  );
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
    overlaysState.forEach((overlay) =>
      overlay.setMap(null)
    );

    const markers: any[] = [];
    const overlays: any[] = [];

    positions.forEach((position, index) => {
      const newMarker = new kakaoMaps.Marker({
        map: kakaoMap,
        position,
        image: markerImage,
        clickable: true,
      });
      const newOverlay = new kakaoMaps.CustomOverlay({
        map: kakaoMap,
        position,
        content: generateOverlayContent(
          index,
          data[index],
          fieldNameMap,
          dataKeyPick
        ),
        yAnchor: 1,
        zIndex: 1,
      });

      kakaoMaps.event.addListener(
        newMarker,
        "click",
        () => {
          newOverlay.setMap(kakaoMap);
        }
      );

      markers.push(newMarker);
      overlays.push(newOverlay);
    });

    markersRef.current = markers;
    setOverlaysState(overlays);

    if (positions.length > 0) {
      const bounds = positions.reduce(
        (bounds, coordinate) => bounds.extend(coordinate),
        new kakaoMaps.LatLngBounds()
      );

      kakaoMap.setBounds(bounds);
    }
  }, [kakaoMap, data, dataKeyPick]);
  /**
   * overlaysState는 오버레이 렌더링 후 '닫기' 이벤트 리스너를 추가하기 위해
   * state와 effect로 관리합니다.
   *
   * 따라서 위의 deps array에서는 의도적으로 제외합니다.
   * */

  useEffect(() => {
    overlaysState.forEach((overlay, index) => {
      document
        .getElementById(getOverlayId(index))
        ?.addEventListener("click", () =>
          overlay.setMap(null)
        );
    });
  }, [overlaysState]);

  useEffect(() => {
    if (!kakaoMap) {
      return;
    }

    document.addEventListener("map:move", (event) => {
      const kakaoMaps = kakao.maps;
      const position = new kakaoMaps.LatLng(
        // @ts-ignore
        event.detail.latitude,
        // @ts-ignore
        event.detail.longitude
      );

      kakaoMap.panTo(position);
    });
  }, [kakaoMap]);

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
