// Sidebar.tsx
import { NavLink } from "react-router-dom";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const sidebarWidth = isOpen ? 250 : 60;

  return (
    <div
      className="bg-dark text-white p-2"
      style={{
        width: sidebarWidth,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        overflowY: "auto",
        zIndex: 1000,
        transition: "width 0.3s",
      }}
    >
      <h5 className="text-center mb-3">
        {isOpen ? "🏥 Hospital Linen" : "🏥"}
      </h5>
      <hr className="text-white my-2" />
      <ul className="nav flex-column small">
        <li className="nav-item mb-1">
          <NavLink to="/" className="nav-link text-white">
            <i className="bi bi-speedometer2 me-2" />
            {isOpen && "Dashboard"}
          </NavLink>
        </li>

        <li className="nav-item">
          <span className="nav-link text-white fw-bold mt-2">
            {isOpen ? "📊 Laporan" : "📊"}
          </span>
          <hr className="text-white my-2" />

          <ul className="nav flex-column ms-2">
            <li>
              <NavLink to="/batch-report" className="nav-link text-white">
                <i className="bi bi-list-check me-2" />
                {isOpen && "Batch Info"}
              </NavLink>
            </li>

            <li>
              <NavLink to="/riwayat" className="nav-link text-white">
                <i className="bi bi-clock-history me-2" />
                {isOpen && "Riwayat Linen"}
              </NavLink>
            </li>
          </ul>
        </li>

        <li className="nav-item">
          <span className="nav-link text-white fw-bold mt-2">
            {isOpen ? "🗂️ Data Master" : "🗂️"}
          </span>
          <hr className="text-white my-2" />
          <ul className="nav flex-column ms-2">
            <li>
              <NavLink to="/master-linen" className="nav-link text-white">
                <i className="bi bi-file-earmark-text me-2" />
                {isOpen && "Master Linen"}
              </NavLink>
            </li>
            <li>
              <NavLink to="/ruangan" className="nav-link text-white">
                <i className="bi bi-building me-2" />
                {isOpen && "Ruangan"}
              </NavLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
