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
    <div className="min-h-screen  p-6 md:p-10 text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">
          On The Way Detail
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          ← Kembali
        </button>
      </div>

      {/* SEARCH & ACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search linen ID or PIC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/inventory/onway/history")}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            History
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "pic")}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="date">Sort by Date</option>
            <option value="pic">Sort by PIC</option>
          </select>

          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-400 text-black font-medium hover:bg-emerald-300 transition"
            title="Cetak / Export ke PDF"
          >
            <Printer size={18} strokeWidth={1.5} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* TABLE (GLASS) */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(36,214,173,0.08)",
          boxShadow: "0 12px 40px rgba(36,214,173,0.06)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10 text-gray-300 uppercase text-xs tracking-wider">
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
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    Tidak ada linen ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-5 py-3 font-mono text-emerald-300">
                      {item.storage_pic}
                    </td>
                    <td className="px-5 py-3 text-white">{item.linen_id}</td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(item.storage_time_out).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-white/5 text-sm text-gray-400 flex justify-between">
          <span>Showing {filteredData.length} items</span>
          <span>On The Way Inventory</span>
        </div>
      </div>
    </div>
  );
}
