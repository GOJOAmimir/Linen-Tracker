import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; 

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setError(data.message || "Login gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-page">
      {/* overlay gelap/warna */}
      <div className="login-overlay" />

      <div className="login-center">
        <div className="login-card">
          <div className="text-center mb-3">
            {/* logo kecil atau judul */}
            <img src="/images/logo-small.ico" alt="logo" className="mb-2" style={{height:68}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
            <h4 className="mb-0">RSUD CILEUNGSI</h4>
            <div className="text-muted" style={{fontSize:13}}>Sistem RFID Linen Tracking</div>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small">Username</label>
              <input
                className="form-control form-control-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan username"
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="form-label small">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100">
              Login
            </button>
          </form>

          <div className="text-center mt-3 text-muted" style={{fontSize:12}}>
            © RSUD {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
