import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
);

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

  const labels = data.map((d) => d.tanggal);
  const values = data.map((d) => d.jumlah);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Linen / Hari",
        data: values,
        backgroundColor: "#24D6AD",
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
      },
      tooltip: {
        padding: 8,
        titleColor: "#0b2b26",
        bodyColor: "#04110f",
        backgroundColor: "#ffffff",
        borderColor: "rgba(0,0,0,0.06)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#CFECE1",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255,255,255,0.04)",
          drawBorder: false,
        },
        ticks: {
          color: "#CFECE1",
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="flex flex-col h-full rounded-xl">
      {/* Header */}
      <div className="px-4 py-3 text-center">
        <h5 className="mb-0 text-lg font-semibold text-white border rounded-lg p-2">
          Grafik Linen Per Hari
        </h5>
      </div>
      {/* Chart container */}
      <div className=" flex-1 px-4 pb-4">
        <div
          className="w-full rounded-lg h-full overflow-hidden border"
          style={{
            background:
              "linear-gradient(180deg, rgba(36,34,34,0.45), rgba(18,20,19,0.35))",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(36,214,173,0.06)",
          }}
        >
          <div className="h-full p-2">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
