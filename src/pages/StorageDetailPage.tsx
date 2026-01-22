import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

type LinenDetail = {
  epc: string;
  pic: string;
  storage_type?: string;
  waktu: string;
};

const StorageDetailPage: React.FC = () => {
  const { linenType } = useParams<{ linenType: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<LinenDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"epc" | "waktu" | "pic">("epc");

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory/storage/${encodeURIComponent(
            linenType ?? "",
          )}`,
        );

        if (mounted) {
          if (res.data && Array.isArray(res.data.data)) {
            setData(res.data.data);
          } else if (res.data && Array.isArray(res.data)) {
            // fallback if API returns array directly
            setData(res.data);
          } else {
            setData([]);
          }
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("Gagal mengambil data. Coba lagi nanti.");
          setData([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [linenType]);

  const handlePrint = () => {
    window.print();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = data.slice();
    if (q) {
      list = list.filter(
        (d) =>
          (d.epc ?? "").toLowerCase().includes(q) ||
          (d.pic ?? "").toLowerCase().includes(q) ||
          (d.waktu ?? "").toLowerCase().includes(q),
      );
    }

    if (sortBy === "epc") list.sort((a, b) => (a.epc > b.epc ? 1 : -1));
    if (sortBy === "waktu") list.sort((a, b) => (a.waktu > b.waktu ? -1 : 1)); // newest first
    if (sortBy === "pic") list.sort((a, b) => (a.pic > b.pic ? 1 : -1));

    return list;
  }, [data, search, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] text-gray-300 p-6">
        <div className="text-lg">Memuat data detail...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] p-6 md:p-10 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/6 hover:bg-white/8 border border-white/6 text-sm transition"
          >
            ← Kembali
          </button>

          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Detail Linen:{" "}
              <span className="text-emerald-300">{linenType ?? "-"}</span>
            </h2>
            <div className="text-sm text-gray-300 mt-1">{data.length} item</div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-64">
            <label className="sr-only" htmlFor="search">
              Cari
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search EPC or Waktu..."
              className="w-full px-3 py-2 rounded-lg bg-white/4 border border-white/8 placeholder:text-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "epc" | "waktu" | "pic")
            }
            className="px-3 py-2 rounded-lg bg-white/4 border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Urutkan"
          >
            <option value="epc">Sort by EPC (A→Z)</option>
            <option value="waktu">Sort by Waktu (baru→lama)</option>
            <option value="pic">Sort by PIC (A→Z)</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-md bg-emerald-400 text-black font-medium hover:bg-emerald-300 transition"
            title="Cetak / Print"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

      {/* Table (glass card) */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(36,214,173,0.06)",
          boxShadow: "0 10px 30px rgba(36,214,173,0.04)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-gray-300 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">EPC</th>
                <th className="px-5 py-3 text-left">PIC</th>
                <th className="px-5 py-3 text-left">Storage Type</th>
                <th className="px-5 py-3 text-left">Waktu Masuk</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr
                    key={`${item.epc}-${idx}`}
                    className="border-t border-white/6 hover:bg-white/6 transition"
                  >
                    <td className="px-5 py-3 align-middle font-mono text-emerald-300">
                      {item.epc}
                    </td>

                    <td className="px-5 py-3 align-middle text-white">
                      {item.pic}
                    </td>

                    <td className="px-5 py-3 align-middle text-gray-300">
                      {item.storage_type ?? "-"}
                    </td>

                    <td className="px-5 py-3 align-middle text-gray-400">
                      {(() => {
                        const d = new Date(item.waktu);
                        return isNaN(d.getTime())
                          ? item.waktu
                          : d.toLocaleString();
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="px-4 py-3 border-t border-white/6 flex items-center justify-between text-sm text-gray-300">
          <div>
            Showing {filtered.length} of {data.length}
          </div>
          <div className="text-gray-400">Storage details</div>
        </div>
      </div>
    </div>
  );
};

export default StorageDetailPage;
