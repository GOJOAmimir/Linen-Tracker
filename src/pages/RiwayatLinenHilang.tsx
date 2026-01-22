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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-white">
        Riwayat Linen Hilang
      </h2>

      {/* {data.length === 0 ? (
        <div className="text-gray-400">Tidak ada linen yang hilang</div>
      ) : ( */}
      <div className="w-full overflow-x-auto">
        <div
          className="min-w-[900px] rounded-xl bg-white/5 backdrop-blur-md border border-emerald-400/10 overflow-hidden"
          role="region"
          aria-label="Tabel Riwayat Linen Hilang"
        >
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-black/30 backdrop-blur-sm">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-300">
                  Linen ID
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-300">
                  Tipe
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-300">
                  Ukuran
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-300">
                  Max Cuci
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-300">
                  Total Cuci
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-300">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-300">
                  Terakhir Terbaca
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-300">
                  Jam Hilang
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr
                  key={item.LINEN_ID}
                  className="border-b border-white/6 even:bg-white/2 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 align-top font-mono text-emerald-200">
                    {item.LINEN_ID}
                  </td>

                  <td className="px-4 py-3 align-top text-gray-200">
                    {item.LINEN_TYPE}
                  </td>

                  <td className="px-4 py-3 align-top text-gray-200">
                    {item.LINEN_HEIGHT} x {item.LINEN_WIDTH} cm
                  </td>

                  <td className="px-4 py-3 align-top text-gray-200">
                    {item.LINEN_MAX_CYCLE}
                  </td>

                  <td className="px-4 py-3 align-top text-gray-200">
                    {item.LINEN_TOTAL_WASH}
                  </td>

                  <td className="px-4 py-3 align-top text-gray-200 max-w-[320px] break-words">
                    {item.LINEN_DESCRIPTION}
                  </td>

                  <td className="px-4 py-3 align-top text-sm text-gray-400">
                    {item.storage_time_out
                      ? new Date(item.storage_time_out).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-4 py-3 align-top font-semibold text-rose-400">
                    {item.hourdiff} jam
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* )} */}
    </div>
  );
};

export default RiwayatLinenHilang;
