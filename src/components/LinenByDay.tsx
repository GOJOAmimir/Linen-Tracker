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
    fetch(`${import.meta.env.VITE_API_URL}/linen/daily-in`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success && Array.isArray(resJson.data)) {
          setData(resJson.data);
        } else {
          console.warn("Unexpected daily-in response", resJson);
        }
      })
      .catch((err) => console.error("Fetch daily-in error:", err));
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
