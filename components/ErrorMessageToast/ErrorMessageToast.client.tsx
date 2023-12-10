"use client";

import { useEffect, useState } from "react";
import { cx } from "class-variance-authority";

import type { ErrorId } from "./ErrorMessageToast.type";

const errorMessages: Record<ErrorId, string> = {
  invalidAddressField: "주소 필드가 올바르지 않습니다.",
  invalidLatitudeField: "위도 필드가 올바르지 않습니다.",
  invalidLongitudeField: "경도 필드가 올바르지 않습니다.",
  invalidCoordinateFields:
    "위도와 경도 필드가 올바르지 않습니다.",
  sameCoordinateFieldNames:
    "위도와 경도는 서로 다른 필드여야 합니다.",
};

const isValidErrorId = (
  errorId: string
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

  const errorMessage = isValidErrorId(errorId)
    ? errorMessages[errorId]
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
