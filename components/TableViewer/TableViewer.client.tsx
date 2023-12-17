import type { MainPageSearchParamsWithServiceName } from "@/app/page";
import { useInfiniteOpenData } from "../_hooks/useInfiniteOpenData";
import { useState } from "react";

export const TableViewer = ({
  searchParams,
  fieldNameMap,
}: {
  searchParams: MainPageSearchParamsWithServiceName;
  fieldNameMap: Record<string, string>;
}) => {
  const { data } = useInfiniteOpenData({
    searchParams,
  });

  const headers = Object.keys(data[0]).filter(
    (key) => key !== "coordinate"
  );

  const [selectedPoint, setSelectedPoint] = useState("");

  return (
    <div className="overflow-auto w-full h-[80vh] border-collapse mt-4">
      <table>
        <thead>
          <tr>
            <th className="whitespace-nowrap px-3 py-2"></th>
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-3 py-2"
              >
                {fieldNameMap[header] ?? header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const key = `${row.coordinate.latitude} ${row.coordinate.longitude} ${index}`;
            const isSelected = key === selectedPoint;

            return (
              <tr
                key={key}
                className={`border-t border-b border-solid border-gray-300 cursor-pointer ${
                  isSelected ? "bg-gray-200" : ""
                }`}
                onClick={() => {
                  document.dispatchEvent(
                    new CustomEvent("map:move", {
                      detail: {
                        latitude: row.coordinate.latitude,
                        longitude: row.coordinate.longitude,
                      },
                    })
                  );
                  setSelectedPoint(key);
                }}
              >
                <td className="px-2 py-1 text-center whitespace-nowrap">
                  {index + 1}
                </td>
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-2 py-1 text-center whitespace-nowrap"
                  >
                    {row[header] as string}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
