import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 h-screen w-full">
      <div className="hidden sm:block">
        <img
          className="w-full h-full object-cover"
          src="../public/images/laundry-bg.png"
          alt="Laundry Background"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop";
          }}
        />
      </div>

      <div className="bg-gray-800 flex flex-col justify-center">
        <form
          onSubmit={handleLogin}
          className="max-w-[400px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-8 border border-emerald-300"
        >
          <div className="text-center mb-6">
            <img
              src="/images/logo-small.ico"
              alt="logo"
              className="h-16 mx-auto mb-3"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <h2 className="text-3xl text-white font-bold">RSUD CILEUNGSI</h2>
            <p className="text-gray-400 text-sm mt-1">
              Sistem RFID Linen Tracking
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg px-4 py-2 mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col text-gray-400 py-2">
            <label>Username</label>
            <input
              className="rounded-lg bg-gray-700 mt-2 p-2 focus:border-[#24D6AD] focus:bg-gray-800 focus:outline-none text-white"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Masukkan username"
              autoFocus
            />
          </div>

          <div className="flex flex-col text-gray-400 py-2">
            <label>Password</label>
            <input
              className="p-2 rounded-lg bg-gray-700 mt-2 focus:border-[#24D6AD] focus:bg-gray-800 focus:outline-none text-white"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full my-5 py-2 bg-[#24D6AD] shadow-lg shadow-[#24D6AD]/50 hover:shadow-[#24D6AD]/40 text-black font-semibold rounded-lg transition-all"
          >
            LOGIN
          </button>

          <div className="text-center">
            <p>
              don't have an accont? <a href="">Contact IT Support</a>
            </p>
          </div>

          <div className="text-center text-gray-500 text-xs">
            © RSUD {new Date().getFullYear()}
          </div>
        </form>
      </div>
    </div>
  );
}
