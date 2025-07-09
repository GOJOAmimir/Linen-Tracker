import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type DataEntry = {
  tanggal: string;
  jumlah: number;
};

export default function LinenByDay() {
  const [data, setData] = useState<DataEntry[]>([]);

  useEffect(() => {
    // Placeholder data, ganti nanti dengan fetch dari API
    const dummyData: DataEntry[] = [
      { tanggal: "2025-07-04", jumlah: 38 },
      { tanggal: "2025-07-05", jumlah: 42 },
      { tanggal: "2025-07-06", jumlah: 25 },
      { tanggal: "2025-07-07", jumlah: 30 },
      { tanggal: "2025-07-08", jumlah: 45 },
      { tanggal: "2025-07-09", jumlah: 60 },
    ];
    setData(dummyData);
  }, []);

  const chartData = {
    labels: data.map((d) => d.tanggal),
    datasets: [
      {
        label: "Total Linen / Hari",
        data: data.map((d) => d.jumlah),
        backgroundColor: "#0d6efd",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="card shadow-sm mt-0">
      <div className="card-header bg-white">
        <h5 className="mb-0">Grafik Linen per Hari</h5>
      </div>
      <div className="card-body">
        <Bar data={chartData} options={chartOptions} height={100} />
      </div>
    </div>
  );
}
