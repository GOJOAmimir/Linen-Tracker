import React, { useEffect, useState } from "react";
import axios from "axios";

interface LinenLog {
  storage_pic: string;
  linen_id: string;
  storage_type: string;
  storage_time_in: string;
}

const LogHistory: React.FC = () => {
  const [data, setData] = useState<LinenLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory/storage_keep_log`,
        );

        if (res.data.success && Array.isArray(res.data.storage_keep_log)) {
          setData(res.data.storage_keep_log);
        } else {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Memuat data log storage...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
        Log Storage
      </h2>

      {data.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          Tidak ada log ditemukan
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-emerald-400/20 shadow-sm dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-black/30">
                <tr className="border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wide">
                  <th className="px-5 py-4 text-left">Penerima</th>
                  <th className="px-5 py-4 text-left">Linen ID</th>
                  <th className="px-5 py-4 text-left">Storage Type</th>
                  <th className="px-5 py-4 text-left">Waktu Masuk</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                  >
                    <td className="px-5 py-3 font-mono text-emerald-600 dark:text-emerald-300">
                      {item.storage_pic}
                    </td>

                    <td className="px-5 py-3 text-gray-900 dark:text-white">
                      {item.linen_id}
                    </td>

                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {item.storage_type}
                    </td>

                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(item.storage_time_in).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* footer glow line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent dark:via-emerald-400/40" />
        </div>
      )}
    </div>
  );
};

export default LogHistory;
