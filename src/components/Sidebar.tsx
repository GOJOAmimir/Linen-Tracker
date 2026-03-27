// Sidebar.tsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserRole } from "./auth";
import {
  BsSpeedometer2,
  BsBoxSeam,
  BsCheck2Circle,
  BsClipboardData,
  BsExclamationCircle,
  BsFileEarmarkText,
  BsBox,
  BsBuilding,
} from "react-icons/bs";
import { Archive } from "lucide-react";

type SidebarProps = { isOpen: boolean; onClose?: () => void };

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const sidebarWidth = isOpen ? 250 : 60;
  const navigate = useNavigate();
  const location = useLocation();
  const role = getUserRole();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 500);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  const handleNavLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isActive = (path: string, exact = false) => {
    const current = location.pathname;
    if (exact) {
      return current === path;
    }
    return current === path || current.startsWith(path + "/");
  };

  const linkBase =
    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 overflow-hidden relative";

  const linkClass = (active: boolean) =>
    [
      linkBase,
      active
        ? "bg-emerald-400 text-black"
        : `
        text-gray-700 hover:bg-gray-100 hover:text-black
        dark:text-[#D1EBDA] dark:hover:bg-white/5 dark:hover:text-white
      `,
    ].join(" ");

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-998"
          onClick={onClose}
          style={{ display: isOpen ? "block" : "none" }}
        />
      )}
      <aside
        className="fixed top-0 left-0 h-screen z-999 select-none shadow-2xl"
        style={{
          width: isMobile ? (isOpen ? 250 : 0) : sidebarWidth,
          transition: "width 0.3s",
          display: isMobile ? (isOpen ? "block" : "none") : "block",
        }}
      >
        <div
          className="
                      h-full flex flex-col
                      bg-white text-gray-800
                      dark:bg-[#242222] dark:text-white
                      border-r border-[#3D3A3A] dark:border-gray-700
                    "
        >
          {/* Header*/}
          <div className="px-3 py-4">
            <h5
              className={`
                          flex items-center justify-center gap-2
                          font-semibold text-sm
                          text-gray-800 dark:text-white
                          transition-opacity duration-300
                          ${isOpen ? "opacity-100" : "opacity-0"}
                        `}
            >
              <Archive size={18} className="text-emerald-400 shrink-0" />
              <span>Linen</span>
            </h5>

            <div
              className={`flex items-center justify-center text-white text-lg mt-1 transition-opacity duration-300 ${
                isOpen ? "hidden" : "block"
              }`}
              aria-hidden={isOpen}
              title="Linen"
            >
              <Archive size={18} className="text-emerald-400 shrink-0" />
            </div>
          </div>

          {/* Navigation */}
          <div className="px-2">
            <nav className="space-y-1">
              {/* Dashboard - exact match */}
              <NavLink
                to="/"
                end
                className={linkClass(isActive("/", true))}
                title="Dashboard"
                onClick={handleNavLinkClick}
              >
                <BsSpeedometer2 className="text-current text-xl flex-shrink-0" />
                <span
                  className={`truncate text-sm transition-opacity duration-200 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ whiteSpace: "nowrap" }}
                >
                  Dashboard
                </span>
              </NavLink>

              {/* Batch info - exact match */}
              <NavLink
                to="/information"
                className={linkClass(isActive("/information", true))}
                title="Informasi Batch"
                onClick={handleNavLinkClick}
              >
                <BsBoxSeam className="text-current text-lg flex-shrink-0" />
                <span
                  className={`truncate text-sm transition-opacity duration-200 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Informasi Batch
                </span>
              </NavLink>

              {role === "admin" && (
                <>
                  <div className="pt-3">
                    <div
                      className={`px-3 py-1 text-xs font-semibold uppercase text-gray-300 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Laporan
                    </div>

                    {/* Riwayat Selesai */}
                    <NavLink
                      to="/riwayat/selesai"
                      className={linkClass(isActive("/riwayat/selesai", true))}
                      title="Riwayat Selesai"
                      onClick={handleNavLinkClick}
                    >
                      <BsCheck2Circle className="text-current text-lg flex-shrink-0" />
                      <span
                        className={`truncate text-sm transition-opacity duration-200 ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Riwayat Selesai
                      </span>
                    </NavLink>

                    {/* Riwayat Registered */}
                    <NavLink
                      to="/riwayat/register"
                      className={linkClass(isActive("/riwayat/register", true))}
                      title="Riwayat Registered"
                      onClick={handleNavLinkClick}
                    >
                      <BsClipboardData className="text-current text-lg flex-shrink-0" />
                      <span
                        className={`truncate text-sm transition-opacity duration-200 ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Riwayat Registered
                      </span>
                    </NavLink>

                    {/* Riwayat Hilang */}
                    <NavLink
                      to="/riwayat/hilang"
                      className={linkClass(isActive("/riwayat/hilang", true))}
                      title="Riwayat Hilang"
                      onClick={handleNavLinkClick}
                    >
                      <BsExclamationCircle className="text-current text-lg flex-shrink-0" />
                      <span
                        className={`truncate text-sm transition-opacity duration-200 ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Riwayat Hilang
                      </span>
                    </NavLink>
                  </div>

                  <div className="pt-4">
                    <div
                      className={`px-3 py-1 text-xs font-semibold uppercase text-gray-300 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Data Master
                    </div>

                    {/* Master Linen */}
                    <NavLink
                      to="/master-linen"
                      className={linkClass(isActive("/master-linen", true))}
                      title="Master Linen"
                      onClick={handleNavLinkClick}
                    >
                      <BsFileEarmarkText className="text-current text-lg flex-shrink-0" />
                      <span
                        className={`truncate text-sm transition-opacity duration-200 ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Master Linen
                      </span>
                    </NavLink>

                    {/* Inventory - group; active for /inventory and all subroutes */}
                    <NavLink
                      to="/inventory"
                      className={linkClass(isActive("/inventory", false))}
                      title="Inventory"
                      onClick={handleNavLinkClick}
                    >
                      <BsBox className="text-current text-lg flex-shrink-0" />
                      <span
                        className={`truncate text-sm transition-opacity duration-200 ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Inventory
                      </span>
                    </NavLink>

                    {/* Ruangan */}
                    <NavLink
                      to="/ruangan"
                      className={linkClass(isActive("/ruangan", true))}
                      title="Ruangan"
                      onClick={handleNavLinkClick}
                    >
                      <BsBuilding className="text-current text-lg flex-shrink-0" />
                      <span
                        className={`truncate text-sm transition-opacity duration-200 ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Ruangan
                      </span>
                    </NavLink>
                  </div>
                </>
              )}
            </nav>
          </div>

          <div className="flex-1" />

          {/* Logout */}
          {/* <div className="p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              borderRadius: isOpen ? 8 : 999,
              padding: isOpen ? "8px 12px" : "8px",
              border: "1px solid rgba(255,255,255,0.06)",
              background: "transparent",
              color: "#FFFFFF",
            }}
            title="Logout"
          >
            <i className="bi bi-box-arrow-right text-lg" />
            <span
              className={`text-sm transition-opacity duration-200 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div> */}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
