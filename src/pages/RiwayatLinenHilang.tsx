import React, { useEffect, useState } from "react";
import axios from "axios";

interface LinenLost {
  LINEN_ID: string;
  LINEN_TYPE: string;
  LINEN_HEIGHT: number;
  LINEN_WIDTH: number;
  LINEN_MAX_CYCLE: number;
  LINEN_TOTAL_WASH: number;
  LINEN_DESCRIPTION: string;
  storage_time_out: string;
  hourdiff: number;
}

const RiwayatLinenHilang: React.FC = () => {
  const [data, setData] = useState<LinenLost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/missing`,
        );
        if (res.data?.success) setData(res.data.data);
        else if (Array.isArray(res.data)) setData(res.data);
        else setData([]);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-300">Memuat data linen hilang...</div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
        Riwayat Linen Hilang
      </h2>

      <div className="w-full overflow-x-auto">
        <div
          className="min-w-[900px] rounded-xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-emerald-400/10 overflow-hidden"
          role="region"
          aria-label="Tabel Riwayat Linen Hilang"
        >
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 dark:bg-black/30 backdrop-blur-sm">
              <tr className="text-left">
                {[
                  "Linen ID",
                  "Tipe",
                  "Ukuran",
                  "Max Cuci",
                  "Total Cuci",
                  "Deskripsi",
                  "Terakhir Terbaca",
                  "Jam Hilang",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr
                  key={item.LINEN_ID}
                  className="border-b border-gray-200 dark:border-white/10 even:bg-gray-50 dark:even:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <td className="px-4 py-3 align-top font-mono text-emerald-700 dark:text-emerald-300">
                    {item.LINEN_ID}
                  </td>

                  <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300">
                    {item.LINEN_TYPE}
                  </td>

                  <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300">
                    {item.LINEN_HEIGHT} x {item.LINEN_WIDTH} cm
                  </td>

                  <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300">
                    {item.LINEN_MAX_CYCLE}
                  </td>

                  <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300">
                    {item.LINEN_TOTAL_WASH}
                  </td>

                  <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300 max-w-[320px] break-words">
                    {item.LINEN_DESCRIPTION}
                  </td>

                  <td className="px-4 py-3 align-top text-sm text-gray-500 dark:text-gray-400">
                    {item.storage_time_out
                      ? new Date(item.storage_time_out).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-4 py-3 align-top font-semibold text-rose-600 dark:text-rose-400">
                    {item.hourdiff} jam
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiwayatLinenHilang;
