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
    <div className="grid grid-cols-1 sm:grid-cols-2 h-screen w-full bg-gray-100 dark:bg-gray-900">
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

      <div className="flex flex-col justify-center bg-gray-100 dark:bg-gray-800">
        <form
          onSubmit={handleLogin}
          className="max-w-[400px] w-full mx-auto rounded-lg p-8 px-8
                   bg-white dark:bg-gray-900
                   border border-emerald-300 dark:border-emerald-400/60"
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              RSUD CILEUNGSI
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Sistem RFID Linen Tracking
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 dark:text-red-400 rounded-lg px-4 py-2 mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col text-gray-600 dark:text-gray-400 py-2">
            <label>Username</label>
            <input
              className="rounded-lg mt-2 p-2
                       bg-gray-200 dark:bg-gray-700
                       text-gray-900 dark:text-white
                       focus:border-emerald-400 focus:outline-none"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Masukkan username"
              autoFocus
            />
          </div>

          <div className="flex flex-col text-gray-600 dark:text-gray-400 py-2">
            <label>Password</label>
            <input
              className="rounded-lg mt-2 p-2
                       bg-gray-200 dark:bg-gray-700
                       text-gray-900 dark:text-white
                       focus:border-emerald-400 focus:outline-none"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full my-5 py-2 rounded-lg font-semibold transition-all
                     bg-emerald-400 text-black
                     hover:bg-emerald-300
                     shadow-lg shadow-emerald-400/40"
          >
            LOGIN
          </button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            don't have an account?{" "}
            <a href="#" className="text-emerald-500">
              Contact IT Support
            </a>
          </div>

          <div className="text-center text-gray-500 text-xs mt-3">
            © RSUD {new Date().getFullYear()}
          </div>
        </form>
      </div>
    </div>
  );
}
