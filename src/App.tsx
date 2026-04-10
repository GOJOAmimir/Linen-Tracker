// App.tsx
import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MasterLinen from "./pages/MasterLinen";
import Ruangan from "./pages/Ruangan";
import RiwayatSelesai from "./pages/RiwayatSelesai";
import type { StatusCounts } from "./components/StatusSummary";
import BatchSelesaiInfo from "./pages/BatchSelesai";
import RiwayatRegister from "./pages/RiwayatRegister";
import LoginPage from "./pages/LoginPage";
import LinenHilang from "./pages/RiwayatLinenHilang";
import InventoryPage from "./pages/InventoryPage";
import OnWayPage from "./pages/OnWayPage";
import StoragePage from "./pages/StoragePage";
import StorageDetailPage from "./pages/StorageDetailPage";
import StorageLog from "./pages/StorageLog";
import OnWayLog from "./pages/OnWayLog";
import { ThemeProvider } from "./context/ThemeContext";

type LinenItem = {
  EPC: string;
  Tipe: string;
  Status: string;
};

function App() {
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    intransit: 0,
    dicuci: 0,
    bersih: 0,
    hilang: 0,
    dipakai: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 500;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL;
    const isSecure = window.location.protocol === "https:";
    const isWsInsecure = wsUrl?.startsWith("ws://");

    if (!wsUrl || (isSecure && isWsInsecure)) {
      console.warn(
        "WebSocket diblokir: Tidak bisa menggunakan ws:// di halaman HTTPS. " +
          "Gunakan wss:// atau jalankan di localhost.",
      );
      return;
    }

    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket Connected");
      };

      ws.onmessage = (msg) => {
        try {
          const json = JSON.parse(msg.data);
          if (json.type === "linen_status") {
            const list = json.data as LinenItem[];
            setStatusCounts({
              bersih: list.filter((x) => x.Status === "Bersih").length,
              dicuci: list.filter((x) => x.Status === "Dicuci").length,
              intransit: list.filter((x) => x.Status === "InTransit").length,
              dipakai: list.filter((x) => x.Status === "Dipakai").length,
              hilang: list.filter((x) => x.Status === "Hilang").length,
            });
          }
        } catch (err) {
          console.error("❌ WS parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket Error:", err);
      };

      ws.onclose = () => {
        console.log("ℹ️ WebSocket Disconnected");
      };
    } catch (err) {
      console.error("Critical WS Error:", err);
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <div className="flex w-screen min-h-screen overflow-x-hidden">
                  {/* Sidebar */}
                  <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                  />

                  {/* Main content */}
                  <div
                    className="flex flex-col flex-1 w-full transition-all duration-300"
                    style={{
                      marginLeft: isMobile ? 0 : sidebarOpen ? 250 : 60,
                    }}
                  >
                    <Navbar
                      toggleSidebar={() => setSidebarOpen((p) => !p)}
                      sidebarOpen={sidebarOpen}
                    />

                    {/* Page container */}
                    <main className="flex-1 px-4 pt-4 overflow-y-auto">
                      <Routes>
                        <Route
                          path="/"
                          element={<Dashboard statusCounts={statusCounts} />}
                        />
                        <Route
                          path="/information"
                          element={<BatchSelesaiInfo />}
                        />
                        <Route
                          path="/riwayat/selesai"
                          element={<RiwayatSelesai />}
                        />
                        <Route
                          path="/riwayat/register"
                          element={<RiwayatRegister />}
                        />
                        <Route
                          path="/riwayat/hilang"
                          element={<LinenHilang />}
                        />
                        <Route path="/master-linen" element={<MasterLinen />} />
                        <Route path="/ruangan" element={<Ruangan />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route
                          path="/inventory/storage"
                          element={<StoragePage />}
                        />
                        <Route
                          path="/inventory/onway"
                          element={<OnWayPage />}
                        />
                        <Route
                          path="/inventory/storage/:linenType"
                          element={<StorageDetailPage />}
                        />
                        <Route
                          path="/inventory/storage/history"
                          element={<StorageLog />}
                        />
                        <Route
                          path="/inventory/onway/history"
                          element={<OnWayLog />}
                        />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
