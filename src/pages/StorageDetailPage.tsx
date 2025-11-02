import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

type LinenDetail = {
  epc: string;
  pic: string;
  storage_type: string;
  waktu: string;
};

const StorageDetailPage: React.FC = () => {
  const { linenType } = useParams<{ linenType: string }>();
  const [data, setData] = useState<LinenDetail[]>([]);
  
  useEffect (() =>{
    const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory/storage/${linenType}`);
      if (res.data.success) {
        console.log("Data: ", res.data.data);
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };
    fetchData();
  }, [linenType]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ===== Header ===== */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Detail Linen: {linenType}
      </h2>

  {/* ===== Filter Bar ===== */}
<div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
  {/* Search */}
  <input
    type="text"
    placeholder="Search EPC or Waktu..."
    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
  />

  {/* Right side */}
  <div className="flex items-center gap-3">
    <div className="bg-white border border-blue-300 rounded-lg shadow-sm h-[42px] px-4 flex flex-col items-center justify-center leading-none">
      <span className="text-gray-500 text-xs underline">Total Linen</span>
      <span className="text-blue-600 font-semibold text-sm">{data.length}</span>
    </div>

    {/* Sort */}
    <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none">
      <option>Sort by EPC</option>
      <option>Sort by Status</option>
      <option>Sort by Ukuran</option>
    </select>

    {/* Print */}
          <button
              className="btn btn-outline-success"
              title="Cetak / Export ke PDF"
            >
              🖨️ Print
            </button>
  </div>
</div>

      {/* ===== Data Table ===== */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-center">
          <thead className="bg-blue-100 text-gray-700">
            <tr>
              <th className="px-6 py-3">EPC</th>
              <th className="px-6 py-3">PIC</th>
              <th className="px-6 py-3">Waktu Masuk</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition text-gray-700"
              >
                <td className="px-6 py-3">{item.epc}</td>
                <td className="px-6 py-3">{item.pic}</td>
                <td className="px-6 py-3">{item.waktu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StorageDetailPage;
