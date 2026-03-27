// LinenByDay.tsx
import { useEffect, useMemo, useState } from "react";
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
import type { ChartOptions } from "chart.js";
import { useTheme } from "../context/ThemeContext";

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
  const themeCtx = useTheme();
  const isDark = themeCtx.theme === "dark";

  // --- fetch data
  useEffect(() => {
    let mounted = true;
    fetch(`${import.meta.env.VITE_API_URL}/linen/daily-in`)
      .then((res) => res.json())
      .then((resJson) => {
        if (!mounted) return;
        if (resJson?.success && Array.isArray(resJson.data)) {
          setData(resJson.data);
        } else {
          setData([]);
          console.warn("Unexpected daily-in response", resJson);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error("Fetch daily-in error:", err);
          setData([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const labels = useMemo(() => data.map((d) => d.tanggal), [data]);
  const values = useMemo(() => data.map((d) => d.jumlah), [data]);

  const chartData = useMemo(
    () => ({
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
    }),
    [labels, values],
  );

  const chartOptions = useMemo<ChartOptions<"bar">>(() => {
    const axisColor = isDark ? "#CFECE1" : "#374151";
    const tooltipBg = isDark ? "#0f172a" : "#ffffff";
    const tooltipTitleColor = isDark ? "#e5e7eb" : "#111827";
    const tooltipBodyColor = isDark ? "#e5e7eb" : "#374151";
    const tooltipBorder = isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.06)";
    const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 10,
          backgroundColor: tooltipBg,
          titleColor: tooltipTitleColor,
          bodyColor: tooltipBodyColor,
          borderColor: tooltipBorder,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: axisColor,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
            drawBorder: false,
          },
          ticks: {
            color: axisColor,
            precision: 0,
          },
        },
      },
    };
  }, [isDark]);

  return (
    <div className="flex flex-col h-full rounded-xl">
      {/* Header */}
      <div className="px-4 py-3 text-center">
        <h5 className="text-lg font-semibold text-[#3D3A3A] dark:text-white border border-[#3D3A3A] dark:border-white/80 rounded-lg p-2">
          Grafik Linen Per Hari
        </h5>
      </div>

      {/* Chart */}
      <div className="flex-1 px-4 pb-4">
        <div className="h-full rounded-xl border border-[#3D3A3A] bg-card backdrop-blur-md overflow-hidden">
          <div className="h-full p-3">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
