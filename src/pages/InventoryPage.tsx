import { useNavigate } from "react-router-dom";
import axios from "axios"
import { useEffect, useState } from "react";

type jumlah = {
  storage: string;
  on_the_way: string;
};

export default function InventoryOverview() {
  const [data, setData] = useState<jumlah>({storage: "0", on_the_way: "0"});
  const navigate = useNavigate();

  useEffect (() => {
    const loadSummary = async () => {
      try{
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory/summary`);

        if(res.data.success){
           setData(res.data.data);
        }
      }catch(err){
        console.error("Galgal mengablil data:", err);
      }
    };
    loadSummary();
  }, []);

  

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-10">Inventory Overview</h1>

<div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl mt-16 px-4">
  {/* STORAGE CARD */}
  <div
    onClick={() => navigate("/inventory/storage")}
    className="bg-gray-100 hover:bg-gray-200 shadow-md rounded-2xl p-8 cursor-pointer border-2 border-blue-500 hover:border-blue-600 hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-56 flex flex-col justify-center"
  >
    <h2 className="text-2xl font-semibold mb-3 text-blue-700">Storage</h2>
    <p className="text-5xl font-bold text-blue-600 mb-1">{data.storage}</p>
    <p className="text-gray-600 text-lg">Linen tersedia</p>
  </div>

  {/* ON THE WAY CARD */}
  <div
    onClick={() => navigate("/inventory/onway")}
    className="bg-gray-100 hover:bg-gray-200 shadow-md rounded-2xl p-8 cursor-pointer border-2 border-blue-500 hover:border-blue-600 hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-56 flex flex-col justify-center"
  >
    <h2 className="text-2xl font-semibold mb-3 text-blue-700">On The Way</h2>
    <p className="text-5xl font-bold text-yellow-600 mb-1">{data.on_the_way}</p>
    <p className="text-gray-600 text-lg">Linen dalam perjalanan</p>
  </div>
</div>

    </div>
  );
}
