import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface LinenOut {
  storage_pic: string;
  linen_id: string;
  storage_time_out: string;
}

export default function OnWayPage() {
  const [data, setData] = useState<LinenOut[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "pic">("date");
  const navigate = useNavigate();

  useEffect(() => {
    const loadOnWayData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory/storage_out`,
        );
        if (res.data.success) {
          setData(res.data.storage_out ?? []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadOnWayData();
  }, []);

  const filteredData = useMemo(() => {
    let list = [...data];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.storage_pic.toLowerCase().includes(q) ||
          d.linen_id.toLowerCase().includes(q),
      );
    }

    if (sortBy === "pic") {
      list.sort((a, b) => a.storage_pic.localeCompare(b.storage_pic));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.storage_time_out).getTime() -
          new Date(a.storage_time_out).getTime(),
      );
    }

    return list;
  }, [data, search, sortBy]);

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">
          On The Way Detail
        </h1>
      </div>

      {/* SEARCH & ACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search linen ID or PIC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
          w-full md:w-1/3 px-4 py-2 rounded-lg
          bg-white border border-gray-300 text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-emerald-400
          dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-400
        "
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/inventory/onway/history")}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-white/10 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            title="Log Storage History"
          >
            History
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "pic")}
            className="
            px-4 py-2 rounded-lg
            bg-white border border-gray-300 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-emerald-400
            dark:bg-white/5 dark:border-white/10 dark:text-white
          "
          >
            <option value="date">Sort by Date</option>
            <option value="pic">Sort by PIC</option>
          </select>

          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md
            bg-emerald-400 text-black font-medium
            hover:bg-emerald-300 transition"
            title="Cetak / Export ke PDF"
          >
            <Printer size={18} strokeWidth={1.5} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="
        rounded-xl overflow-hidden
        bg-white border border-gray-200 shadow-sm
        dark:bg-white/5 dark:border-emerald-400/20 dark:backdrop-blur-md
        dark:shadow-[0_12px_40px_rgba(36,214,173,0.06)]
      "
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead
              className="
              border-b border-gray-200 text-gray-600 uppercase text-xs tracking-wider
              dark:border-white/10 dark:text-gray-300
            "
            >
              <tr>
                <th className="px-5 py-3 text-left">Penerima</th>
                <th className="px-5 py-3 text-left">Linen ID</th>
                <th className="px-5 py-3 text-left">Waktu Keluar</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada linen ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="
                    border-t border-gray-200 hover:bg-gray-100 transition
                    dark:border-white/5 dark:hover:bg-white/5
                  "
                  >
                    <td className="px-5 py-3 font-mono text-emerald-600 dark:text-emerald-300">
                      {item.storage_pic}
                    </td>

                    <td className="px-5 py-3">{item.linen_id}</td>

                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(item.storage_time_out).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div
          className="
          px-4 py-3 border-t text-sm flex justify-between
          border-gray-200 text-gray-500
          dark:border-white/5 dark:text-gray-400
        "
        >
          <span>Showing {filteredData.length} items</span>
          <span>On The Way Inventory</span>
        </div>
      </div>
    </div>
  );
}
