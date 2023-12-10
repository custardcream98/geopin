"use client";

import { useEffect, useState } from "react";
import { cx } from "class-variance-authority";

import { ErrorId } from "./ErrorMessageToast.type";

const errorMessages: Record<ErrorId, string> = {
  [ErrorId.InvalidAddressField]:
    "주소 필드가 올바르지 않습니다.",
  [ErrorId.InvalidLatitudeField]:
    "위도 필드가 올바르지 않습니다.",
  [ErrorId.InvalidLongitudeField]:
    "경도 필드가 올바르지 않습니다.",
  [ErrorId.InvalidCoordinateFields]:
    "위도와 경도 필드가 올바르지 않습니다.",
  [ErrorId.SameCoordinateFieldNames]:
    "위도와 경도는 서로 다른 필드여야 합니다.",
  [ErrorId.FailedToFetchOpenDataSeoulSample]:
    "공공데이터 서울 샘플 데이터를 불러올 수 없습니다.",
  [ErrorId.FailedToFindOpenDataSeoulServiceName]:
    "공공데이터 서비스명을 찾을 수 없습니다.",
};

const isValidErrorId = (
  errorId: number
): errorId is ErrorId => errorId in errorMessages;

export const ErrorMessageToast = ({
  errorId,
}: {
  errorId: string;
}) => {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setShowToast(true);
    const toastTimerId = window.setTimeout(() => {
      setShowToast(false);
    }, 3000);

    return () => clearTimeout(toastTimerId);
  }, [errorId]);

  const parsedErrorId = parseInt(errorId, 10);
  const errorMessage = isValidErrorId(parsedErrorId)
    ? errorMessages[parsedErrorId]
    : "알 수 없는 오류가 발생했습니다.";

  return (
    <div
      className={cx(
        "fixed bottom-0 right-0 p-3 m-3 bg-red-500 rounded-md text-white transition-transform duration-200",
        showToast ? "translate-x-0" : "translate-x-[150%]"
      )}
    >
      {errorMessage}
    </div>
  );
};
