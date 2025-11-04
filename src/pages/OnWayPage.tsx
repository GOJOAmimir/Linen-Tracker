import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface linenOut {
  storage_pic: string;
  linen_id: string;
  storage_time_out: string;
}

export default function OnWayPage() {
  const [data, setData] = useState<linenOut[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const navigate = useNavigate();

  useEffect(() => {
    const loadOnWayData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory/storage_out`
        );
        if (res.data.success) {
          setData(res.data.storage_out);
        } else {
          console.error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadOnWayData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">On The Way Detail</h1>

      {/* ===== SEARCH & FILTER BAR ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <input
          type="text"
          placeholder="Search linen type or PIC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex gap-4">
          <button
            className="btn btn-outline-primary"
            title="Log Storage History"
            onClick={() => navigate("/inventory/onway/history")}
          >
            History
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="type">Sort by Type</option>
            <option value="pic">Sort by Jumlah</option>
          </select>

          <button
            className="btn btn-outline-success"
            title="Cetak / Export ke PDF"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* ===== DATA TABLE ===== */}
      {data.length === 0 ? (
        <div className="text-gray-500">Tidak ada linen ditemukan</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="bg-blue-100 text-gray-800">
              <tr className="text-center">
                <th className="py-3 px-4 text-left">Penerima</th>
                <th className="py-3 px-4 text-left">Linen ID</th>
                <th className="py-3 px-4 text-left">Waktu Keluar</th>
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
}
