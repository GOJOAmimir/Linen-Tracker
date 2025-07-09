// Navbar.tsx
import { useState } from "react";
import {
  BsBellFill,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
} from "react-icons/bs";

interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function Navbar({ toggleSidebar, sidebarOpen }: NavbarProps) {
  const [showNotif, setShowNotif] = useState(false);

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm"
      style={{
        height: 56,
        position: "relative",
        transition: "padding-left 0.3s",
      }}
    >
      <button
        className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
        style={{
          width: "38px",
          height: "38px",
          position: "absolute",
          left: sidebarOpen ? 2 : 2,
          top: 10,
          transition: "left 0.3s",
          zIndex: 1101,
        }}
        onClick={toggleSidebar}
        title={sidebarOpen ? "Tutup menu" : "Buka menu"}
      >
        {sidebarOpen ? (
          <BsChevronDoubleLeft className="fs-5" />
        ) : (
          <BsChevronDoubleRight className="fs-5" />
        )}
      </button>

      <div className="container-fluid">
        <span className="navbar-brand d-flex align-items-center">
          <i className="bi bi-hospital fs-4 me-2"></i>
          <span>Linen Tracker - RSUD CILEUNGSI</span>
        </span>

        <div className="d-flex align-items-center ms-auto gap-3">
          {/* Notifikasi */}
          <div className="position-relative">
            <button
              className="btn btn-outline-light position-relative"
              onClick={() => setShowNotif(!showNotif)}
            >
              <BsBellFill />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>
            {showNotif && (
              <div
                className="position-absolute end-0 mt-2 bg-white text-dark rounded shadow p-2"
                style={{ width: "250px", zIndex: 999 }}
              >
                <strong>Notifikasi Terbaru</strong>
                <ul className="list-unstyled mt-2 mb-0 small">
                  <li>🔄 Linen belum kembali (3)</li>
                  <li>📦 Batch 12:00 belum diproses</li>
                  <li>⚠️ 5 Linen melebihi max cycle</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
