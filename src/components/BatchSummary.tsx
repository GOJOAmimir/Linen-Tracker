import { useEffect, useState } from "react";
import axios from "axios";

const rowHeight = 28;

type Batch = {
  id: number;
  waktu: string;
  totalLinen: number;
  Status: string;
};

export default function BatchSummary() {
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/batches/latest`,
        );

        if (res.data?.success && Array.isArray(res.data.data)) {
          setBatches(res.data.data);
        } else {
          console.warn("Unexpected API response:", res.data);
        }
      } catch (error) {
        console.error("Fetch batch summary error:", error);
      }
    };

    fetchBatches();
  }, []);

  return (
    <div className="flex flex-col h-full rounded-xl">
      {/* Card header */}
      <div className="px-4 py-3 text-center">
        <h5 className="mb-0 text-lg font-semibold text-white border rounded-lg p-2">
          Batch Terbaru
        </h5>
      </div>

      {/* Card body */}
      <div className="px-4 pb-4">
        <div
          className="w-full rounded-lg overflow-hidden border"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
            backdropFilter: "blur(8px)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
          aria-hidden={false}
        >
          <div className="overflow-auto">
            <table className="min-w-full table-fixed text-sm">
              <thead>
                <tr className="text-center">
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-300">
                    ID Batch
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-300">
                    Waktu
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-300 text-center">
                    Total Linen
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase text-gray-300 text-center">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="text-center">
                {batches.map((batch) => (
                  <tr
                    key={batch.id}
                    style={{ height: `${rowHeight}px` }}
                    className="even:bg-white/2"
                  >
                    <td className="px-3 py-2 align-middle text-gray-100 whitespace-nowrap">
                      <span className="font-medium text-sm">#{batch.id}</span>
                    </td>

                    <td className="px-3 py-2 align-middle text-gray-200 whitespace-nowrap">
                      {batch.waktu}
                    </td>

                    <td className="px-3 py-2 align-middle text-center text-gray-100">
                      {batch.totalLinen}
                    </td>

                    <td className="px-3 py-2 align-middle text-center">
                      {batch.Status === "Bersih" ? (
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#24D6AD] text-black">
                          {batch.Status}
                        </span>
                      ) : batch.Status === "Dicuci" ||
                        batch.Status === "Diproses" ? (
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FDB813] text-black">
                          {batch.Status}
                        </span>
                      ) : batch.Status === "Hilang" ? (
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#DC3545] text-white">
                          {batch.Status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-200">
                          {batch.Status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {batches.length === 0 && (
                  <tr style={{ height: `${rowHeight}px` }}>
                    <td
                      colSpan={4}
                      className="px-3 py-2 text-center text-gray-400"
                    >
                      Tidak ada data batch
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
