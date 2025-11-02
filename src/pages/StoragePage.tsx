import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type InvRow = {
  LINEN_TYPE: string;
  jumlah: number;
  storage_type: string;
};

const StoragePage = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [inventory, setInventory] = useState<InvRow[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);
  const [totalTipe, setTotalTipe] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory/storage`);
        if (res.data.success) {
          setInventory(res.data.data);
          setTodayTotal(res.data.today_total);
          setTotalStorage(res.data.total_storage);
          setTotalTipe(res.data.total_tipe);
        }
      } catch (err) {
        console.error("Gagal mengambil data inventory:", err);
      }
    };

    loadInventory();
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 p-10">
      {/* ===== HEADER INFO CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border-l-4 border-blue-500 p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-600 text-sm">New Item Today</h3>
          <p className="text-3xl font-bold text-blue-600">{todayTotal}</p>
        </div>
        <div className="bg-white border-l-4 border-green-500 p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-600 text-sm">Total Linen in Storage</h3>
          <p className="text-3xl font-bold text-green-600">{totalStorage}</p>
        </div>
        <div className="bg-white border-l-4 border-yellow-500 p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-600 text-sm">Storage Type Count</h3>
          <p className="text-3xl font-bold text-yellow-600">{totalTipe}</p>
        </div>
      </div>

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
              title="Cetak / Export ke PDF"
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
<div className="bg-white rounded-xl shadow overflow-hidden">
  <table className="w-full text-center">
    <thead className="bg-blue-100">
      <tr>
        <th className="px-6 py-3">Tipe Linen</th>
        <th className="px-6 py-3">Jumlah</th>
        <th className="px-6 py-3">Storage Type</th>
        <th className="px-6 py-3">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {inventory.map((item, i) => (
        <tr key={i} className="border-b hover:bg-gray-50 transition">
          <td className="px-6 py-3 text-center">{item.LINEN_TYPE}</td>
          <td className="px-6 py-3 text-center">{item.jumlah}</td>
          <td className="px-6 py-3 text-center">{item.storage_type}</td>
          <td className="px-6 py-3">
  <button
    onClick={() => navigate(`/inventory/storage/${item.LINEN_TYPE}`)}
    className="text-blue-600 hover:text-blue-800 font-medium"
  >
    Detail
  </button>
</td>

        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default StoragePage;
