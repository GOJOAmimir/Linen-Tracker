import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
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
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory/storage`,
        );
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      {/* top bar: back + title */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            Storage
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/inventory/storage/history")}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-white/10 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            title="Log Storage History"
          >
            History
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-400 text-black font-medium hover:bg-emerald-300 transition"
            title="Cetak / Export ke PDF"
          >
            <Printer size={18} strokeWidth={1.5} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ===== HEADER INFO CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-5 rounded-xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-emerald-400/10 shadow-sm">
          <h3 className="text-sm text-gray-600 dark:text-gray-200">
            New Item Today
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {todayTotal}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-emerald-400/10 shadow-sm">
          <h3 className="text-sm text-gray-600 dark:text-gray-200">
            Total Linen in Storage
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {totalStorage}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-emerald-400/10 shadow-sm">
          <h3 className="text-sm text-gray-600 dark:text-gray-200">
            Tipe Linen Count
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {totalTipe}
          </p>
        </div>
      </div>

      {/* ===== SEARCH & FILTER BAR ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex-1 flex gap-3">
          <input
            type="text"
            placeholder="Search linen type or PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 placeholder:text-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Cari linen"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Urutkan"
          >
            <option value="type">Sort by Type</option>
            <option value="pic">Sort by Jumlah</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => navigate("/inventory/storage/history")}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-white/10 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            title="History"
          >
            History
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-400 text-black font-medium hover:bg-emerald-300 transition"
            title="Cetak / Export ke PDF"
          >
            <Printer size={18} strokeWidth={1.5} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ===== DATA TABLE ===== */}
      <div className="rounded-xl overflow-hidden">
        <div className="w-full rounded-xl overflow-hidden bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-emerald-400/10 shadow-sm">
          <div className="p-4 overflow-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-100 dark:bg-black/20">
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Tipe Linen
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">
                    Storage Type
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  inventory
                    .filter((it) =>
                      `${it.LINEN_TYPE} ${it.storage_type}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .sort((a, b) => {
                      if (sortBy === "pic") return b.jumlah - a.jumlah;
                      if (sortBy === "type")
                        return a.LINEN_TYPE.localeCompare(b.LINEN_TYPE);
                      return 0;
                    })
                    .map((item, i) => (
                      <tr
                        key={i}
                        className="border-t border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 align-middle">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.LINEN_TYPE}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center align-middle">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.jumlah}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center align-middle text-gray-600 dark:text-gray-300">
                          {item.storage_type}
                        </td>

                        <td className="px-4 py-3 text-center align-middle">
                          <button
                            onClick={() =>
                              navigate(
                                `/inventory/storage/${encodeURIComponent(
                                  item.LINEN_TYPE,
                                )}`,
                              )
                            }
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium transition"
                            aria-label={`Detail ${item.LINEN_TYPE}`}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* summary footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Total Tipe:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {totalTipe}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Total Storage:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {totalStorage}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              New Today:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {todayTotal}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoragePage;
