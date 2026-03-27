import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

type Linen = {
  EPC: string;
  Tipe: string;
  cycle: number;
  MaxCuci: number;
  Status: string;
};

export default function TopCycles() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [topLinen, setTopLinen] = useState<Linen[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/linen/top-cycles`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success) {
          setTopLinen(resJson.data);
        }
      })
      .catch(console.error);
  }, []);

  const statusStyle = (status: string) => {
    if (isDark) {
      switch (status) {
        case "Intransit":
          return "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30";
        case "Bersih":
          return "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30";
        case "Dicuci":
          return "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30";
        default:
          return "bg-gray-500/20 text-gray-300 border border-gray-400/30";
      }
    }

    switch (status) {
      case "Intransit":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Bersih":
        return "bg-cyan-50 text-cyan-700 border border-cyan-200";
      case "Dicuci":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div
      className={`
        flex flex-col h-full rounded-xl shadow
        ${
          isDark
            ? "border border-emerald-400/20 bg-white/5 backdrop-blur-xl"
            : "border border-[#3D3A3A] bg-white"
        }
      `}
    >
      {/* Header */}
      <div
        className={`
          px-4 py-3 border-b text-center
          ${
            isDark
              ? "border-emerald-400/10 text-white"
              : "border-[#3D3A3A] text-slate-800"
          }
        `}
      >
        <h5 className="text-sm font-semibold">
          Top 5 Linen dengan Siklus Tertinggi
        </h5>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table
          className={`
            w-full text-sm
            ${isDark ? "text-gray-200" : "text-slate-700"}
          `}
        >
          <thead
            className={`
              sticky top-0 border-b
              ${
                isDark
                  ? "bg-black/30 backdrop-blur-md border-emerald-400/20"
                  : "bg-slate-50 border-slate-200"
              }
            `}
          >
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">EPC</th>
              <th className="px-4 py-2 font-medium">Tipe</th>
              <th className="px-4 py-2 text-center font-medium">Siklus</th>
              <th className="px-4 py-2 text-center font-medium">Max Cuci</th>
              <th className="px-4 py-2 text-center font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {topLinen.map((linen) => (
              <tr
                key={linen.EPC}
                className={`
                  border-b transition
                  ${
                    isDark
                      ? "border-white/5 hover:bg-white/5"
                      : "border-slate-100 hover:bg-slate-50"
                  }
                `}
              >
                <td className="px-4 py-2 truncate max-w-[140px]">
                  {linen.EPC}
                </td>
                <td className="px-4 py-2">{linen.Tipe}</td>
                <td className="px-4 py-2 text-center">{linen.cycle}</td>
                <td className="px-4 py-2 text-center">{linen.MaxCuci}</td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                      linen.Status,
                    )}`}
                  >
                    {linen.Status}
                  </span>
                </td>
              </tr>
            ))}

            {topLinen.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className={`
                    px-4 py-6 text-center
                    ${isDark ? "text-gray-400" : "text-slate-400"}
                  `}
                >
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
