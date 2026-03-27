import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

type Jumlah = {
  storage: string;
  on_the_way: string;
};

export default function InventoryOverview() {
  const [data, setData] = useState<Jumlah>({
    storage: "0",
    on_the_way: "0",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory/summary`,
        );
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      }
    };
    loadSummary();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16 text-[#3D3A3A] dark:text-white">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        Inventory Overview
      </h1>
      <p className="text-gray-400 mb-16 text-center max-w-xl">
        Monitor linen availability and movement in real time
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl">
        {/* STORAGE */}
        <div
          onClick={() => navigate("/inventory/storage")}
          className="group cursor-pointer rounded-2xl p-8 h-64 flex flex-col justify-center items-center text-center
          bg-white/5 backdrop-blur-xl border border-emerald-400/30
          shadow-[0_0_30px_rgba(16,185,129,0.15)]
          hover:shadow-[0_0_45px_rgba(16,185,129,0.35)]
          hover:border-emerald-400
          transition-all duration-300 hover:scale-[1.03]"
        >
          <h2 className="text-sm tracking-widest text-emerald-400 mb-4">
            STORAGE
          </h2>

          <p className="text-5xl font-bold mb-2 text-[#3D3A3A] dark:text-white">
            {data.storage}
          </p>

          <p className="text-gray-400 mb-6">Linen tersedia</p>

          <span
            className="mt-auto px-6 py-2 rounded-full text-sm font-semibold
            bg-emerald-400/20 text-emerald-300
            group-hover:bg-emerald-400 group-hover:text-black transition"
          >
            LIHAT DETAIL
          </span>
        </div>

        {/* ON THE WAY */}
        <div
          onClick={() => navigate("/inventory/onway")}
          className="group cursor-pointer rounded-2xl p-8 h-64 flex flex-col justify-center items-center text-center
          bg-white/5 backdrop-blur-xl border border-yellow-400/30
          shadow-[0_0_30px_rgba(234,179,8,0.15)]
          hover:shadow-[0_0_45px_rgba(234,179,8,0.35)]
          hover:border-yellow-400
          transition-all duration-300 hover:scale-[1.03]"
        >
          <h2 className="text-sm tracking-widest text-yellow-400 mb-4">
            ON THE WAY
          </h2>

          <p className="text-5xl font-bold mb-2 text-[#3D3A3A] dark:text-white">
            {data.on_the_way}
          </p>

          <p className="text-gray-400 mb-6">Linen dalam perjalanan</p>

          <span
            className="mt-auto px-6 py-2 rounded-full text-sm font-semibold
            bg-yellow-400/20 text-yellow-300
            group-hover:bg-yellow-400 group-hover:text-black transition"
          >
            LIHAT DETAIL
          </span>
        </div>
      </div>
    </div>
  );
}
