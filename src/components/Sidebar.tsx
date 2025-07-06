import { Link } from "react-router-dom";

export function Sidebar() {
  return (
    <div
      className="bg-dark text-white p-3"
      style={{ minHeight: "100vh", width: "250px" }}
    >
      <h4 className="text-center mb-4">Hospital Linen</h4>

      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link to="/" className="nav-link text-white">
            Dashboard
          </Link>
        </li>
        <hr className="text-white my-1" />
        <li className="nav-item mb-2">
          <Link to="/batch-report" className="nav-link text-white">
            Batch
          </Link>
        </li>
        <hr className="text-white my-1" />
        <li className="nav-item mb-2">
          <Link to="/Riwayat" className="nav-link text-white">
            Riwayat
          </Link>
        </li>
        <hr className="text-white my-1" />
        <li className="nav-item mb-2">
          <span className="nav-link text-white fw-bold">Data Linen</span>
          <hr className="text-white my-1" />
          <ul className="nav flex-column ms-3">
            <li className="nav-item">
              <Link to="/master-linen" className="nav-link text-white">
                Master Linen
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/ruangan" className="nav-link text-white">
                Ruangan
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
