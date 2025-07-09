import { useEffect, useState } from "react";

type Linen = {
  EPC: string;
  Tipe: string;
  cycle: number;
  Status: string;
};

export default function TopCycles() {
  const [topLinen, setTopLinen] = useState<Linen[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/linen/top-cycles`)
      .then((res) => res.json())
      .then(setTopLinen)
      .catch((err) => console.error("Fetch top cycles error:", err));
  }, []);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0">Top 5 Linen dengan Siklus Tertinggi</h5>
      </div>
      <div className="card-body p-0">
        <table className="table table-sm mb-0">
          <thead className="table-light">
            <tr>
              <th>EPC</th>
              <th>Tipe</th>
              <th className="text-center">Cycle</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {topLinen.map((linen) => (
              <tr key={linen.EPC}>
                <td>{linen.EPC}</td>
                <td>{linen.Tipe}</td>
                <td className="text-center">{linen.cycle}</td>
                <td className="text-center">
                  <span
                    className={`badge ${
                      linen.Status === "keluar"
                        ? "bg-success"
                        : linen.Status === "hilang"
                        ? "bg-danger"
                        : linen.Status === "dicuci"
                        ? "bg-info text-dark"
                        : "bg-secondary"
                    }`}
                  >
                    {linen.Status}
                  </span>
                </td>
              </tr>
            ))}
            {topLinen.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
