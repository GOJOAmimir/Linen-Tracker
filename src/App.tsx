// App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";

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

function App() {
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    intransit: 0,
    dicuci: 0,
    bersih: 0,
    hilang: 0,
    keluar: 0,
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchCounts = () =>
      fetch(`${import.meta.env.VITE_API_URL}/dashboard/status-summary`)
        .then((r) => r.json())
        .then((resJson) => {
          if (resJson.success && resJson.data) {
            setStatusCounts(resJson.data);
          } else {
            console.warn("Unexpected status summary response:", resJson);
          }
        })
        .catch((err) => console.error("Status summary error:", err));

    fetchCounts();
    const id = setInterval(fetchCounts, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Route login tidak perlu proteksi */}
        <Route path="/login" element={<LoginPage />} />

        {/* Semua route lain diproteksi */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <div className="d-flex">
                <Sidebar isOpen={sidebarOpen} />
                <div
                  className="flex-grow-1"
                  style={{
                    marginLeft: sidebarOpen ? 250 : 60,
                    transition: "margin-left 0.3s",
                    width: "100%",
                  }}
                >
                  <Navbar
                    toggleSidebar={() => setSidebarOpen((prev) => !prev)}
                    sidebarOpen={sidebarOpen}
                  />
                  <div className="pt-4 px-3">
                    <Routes>
                      <Route
                        path="/"
                        element={<Dashboard statusCounts={statusCounts} />}
                      />
                      <Route
                        path="/batch-report/finished"
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
                      <Route path="/riwayat/hilang" element={<LinenHilang />} />
                      <Route path="/master-linen" element={<MasterLinen />} />
                      <Route path="/ruangan" element={<Ruangan />} />
                      <Route path="/inventory" element={<InventoryPage />} />
                      <Route
                        path="/inventory/storage"
                        element={<StoragePage />}
                      />
                      <Route path="/inventory/onway" element={<OnWayPage />} />
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
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
