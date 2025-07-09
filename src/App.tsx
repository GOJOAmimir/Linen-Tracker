// App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import BatchReport from "./pages/BatchReport";
import MasterLinen from "./pages/MasterLinen";
import Ruangan from "./pages/Ruangan";
import Riwayat from "./pages/Riwayat";
import type { StatusCounts } from "./components/StatusSummary";

function App() {
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    kotor: 0,
    dicuci: 0,
    keluar: 0,
    hilang: 0,
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchCounts = () =>
      fetch(`${import.meta.env.VITE_API_URL}/status-summary`)
        .then((r) => r.json())
        .then(setStatusCounts)
        .catch((err) => console.error("Status summary error:", err));

    fetchCounts();
    const id = setInterval(fetchCounts, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Router>
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
              <Route path="/batch-report" element={<BatchReport />} />
              <Route path="/riwayat" element={<Riwayat />} />
              <Route path="/master-linen" element={<MasterLinen />} />
              <Route path="/ruangan" element={<Ruangan />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
