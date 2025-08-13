// Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const sidebarWidth = isOpen ? 250 : 60;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          /* ignore network error, still proceed to client-side logout */
        });
      }
    } catch (e) {
      console.error("Logout request failed:", e);
    } finally {
      // Clear client-side auth
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div
      className="bg-dark text-white p-2 d-flex flex-column"
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
      <div>
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
                <NavLink
                  to="/batch-report/finished"
                  className="nav-link text-white"
                >
                  <i className="bi bi-box-seam me-2" />
                  {isOpen && "Informasi Batch"}
                </NavLink>
              </li>

              <li>
                <NavLink to="/riwayat/selesai" className="nav-link text-white">
                  <i className="bi bi-check2-circle me-2" />
                  {isOpen && "Riwayat Selesai"}
                </NavLink>
              </li>

              <li>
                <NavLink to="/riwayat/register" className="nav-link text-white">
                  <i className="bi bi-clipboard-data me-2" />
                  {isOpen && "Riwayat Registered"}
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

      {/* spacer pushes logout to bottom */}
      <div style={{ flexGrow: 1 }} />

      {/* Logout button bottom */}
      <div className="mb-2">
        <button
          onClick={handleLogout}
          className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
          title="Logout"
          style={{
            borderRadius: isOpen ? 8 : 999,
            padding: isOpen ? "8px 12px" : "8px",
          }}
        >
          <i className="bi bi-box-arrow-right me-2" />
          {isOpen ? "Logout" : <span style={{ fontSize: 18 }}>⎋</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
