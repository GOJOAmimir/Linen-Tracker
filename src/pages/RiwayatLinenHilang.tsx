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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/missing`);
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Memuat data linen hilang...
      </div>
    );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        !Riwayat Linen Hilang
      </h2>

      {data.length === 0 ? (
        <div className="text-gray-500">Tidak ada linen yang hilang 🎉</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="bg-blue-100 text-gray-800">
              <tr>
                <th className="py-3 px-4 text-left">Linen ID</th>
                <th className="py-3 px-4 text-left">Tipe</th>
                <th className="py-3 px-4 text-left">Ukuran</th>
                <th className="py-3 px-4 text-left">Max Cuci</th>
                <th className="py-3 px-4 text-left">Total Cuci</th>
                <th className="py-3 px-4 text-left">Deskripsi</th>
                <th className="py-3 px-4 text-left">Terakhir Terbaca</th>
                <th className="py-3 px-4 text-left">Jam Hilang</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.LINEN_ID} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4 font-mono">{item.LINEN_ID}</td>
                  <td className="py-2 px-4">{item.LINEN_TYPE}</td>
                  <td className="py-2 px-4">
                    {item.LINEN_HEIGHT} x {item.LINEN_WIDTH} cm
                  </td>
                  <td className="py-2 px-4">{item.LINEN_MAX_CYCLE}</td>
                  <td className="py-2 px-4">{item.LINEN_TOTAL_WASH}</td>
                  <td className="py-2 px-4">{item.LINEN_DESCRIPTION}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    {new Date(item.storage_time_out).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 font-semibold text-red-600">
                    {item.hourdiff} jam
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

export default RiwayatLinenHilang;
