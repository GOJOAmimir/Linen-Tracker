export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <span className="navbar-brand">Linen Tracker</span>

        <div className="d-flex align-items-center ms-auto">
          <button className="btn btn-dark position-relative">
            <i className="bi bi-bell fs-5 text-white"></i>
            {/* Badge notifikasi */}
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
