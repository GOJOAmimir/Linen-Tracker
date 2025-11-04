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
          `${import.meta.env.VITE_API_URL}/inventory/storage_out_log`
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
      <div className="flex justify-center items-center h-screen text-gray-600">
        Memuat data log storage...
      </div>
    );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Log Storage</h2>

      {data.length === 0 ? (
        <div className="text-gray-500">Tidak ada log ditemukan</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="bg-blue-100 text-gray-800">
              <tr className="text-center">
                <th className="py-3 px-4 text-left">Penerima</th>
                <th className="py-3 px-4 text-left">Linen ID</th>
                <th className="py-3 px-4 text-left">Waktu Discan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 text-center"
                >
                  <td className="py-2 px-4 font-mono">{item.storage_pic}</td>
                  <td className="py-2 px-4">{item.linen_id}</td>
                  <td className="py-2 px-4">{item.storage_time_out}</td>
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
