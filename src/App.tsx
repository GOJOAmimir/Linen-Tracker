import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import BatchReport from "./pages/BatchReport";
import MasterLinen from "./pages/MasterLinen";
import Ruangan from "./pages/Ruangan";
import type { StatusCounts } from "./components/StatusSummary";
import Riwayat from "./pages/Riwayat";

function App() {
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    kotor: 0,
    dicuci: 0,
    keluar: 0,
    hilang: 0,
  });

  useEffect(() => {
    const fetchCounts = () =>
      fetch("http://localhost:4000/status-summary")
        .then((r) => r.json())
        .then(setStatusCounts)
        .catch((err) => console.error("Status summary error:", err));

    fetchCounts();
    const id = setInterval(fetchCounts, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Router>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 pt-4 px-3">
          <Routes>
            <Route
              path="/"
              element={<Dashboard statusCounts={statusCounts} />}
            />
            <Route path="/batch-report" element={<BatchReport />} />
            <Route path="/Riwayat" element={<Riwayat />} />
            <Route path="/master-linen" element={<MasterLinen />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
