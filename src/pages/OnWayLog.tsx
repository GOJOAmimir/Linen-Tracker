import React, { useEffect, useState } from "react";
import axios from "axios";

interface LinenLog {
  storage_pic: string;
  linen_id: string;
  storage_time_out: string;
}

const LogOutHistory: React.FC = () => {
  const [data, setData] = useState<LinenLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory/storage_out_log`,
        );

        if (res.data.success && Array.isArray(res.data.storage_out_log)) {
          setData(res.data.storage_out_log);
        } else {
          console.warn("Format data tidak sesuai:", res.data);
          setData([]);
        }
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
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        Memuat data log storage...
      </div>
    );

  return (
    <div className="p-6 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-transparent">
      <h2 className="text-3xl font-bold mb-6">Log Storage Out</h2>

      {data.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          Tidak ada log ditemukan
        </div>
      ) : (
        <div
          className="
          overflow-x-auto rounded-xl
          bg-white border border-gray-200 shadow-sm
          dark:bg-white/5 dark:border-white/20 dark:backdrop-blur-lg
        "
        >
          <table className="min-w-full border-collapse">
            <thead>
              <tr
                className="
                border-b border-gray-200 text-left text-sm uppercase tracking-wider text-gray-600
                dark:border-white/20 dark:text-gray-300
              "
              >
                <th className="px-6 py-4">Penerima</th>
                <th className="px-6 py-4">Linen ID</th>
                <th className="px-6 py-4">Waktu Discan</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="
                  border-b border-gray-200 hover:bg-gray-100 transition-colors
                  dark:border-white/10 dark:hover:bg-white/10
                "
                >
                  <td className="px-5 py-3 font-mono text-emerald-600 dark:text-emerald-300">
                    {item.storage_pic}
                  </td>

                  <td className="px-6 py-4 text-sm">{item.linen_id}</td>

                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    {item.storage_time_out}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogOutHistory;
