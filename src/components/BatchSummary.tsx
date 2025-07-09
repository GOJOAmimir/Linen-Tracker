import { useEffect, useState } from "react";

type Batch = {
  id: number;
  waktu: string;
  totalLinen: number;
  status: string;
};

export default function BatchSummary() {
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/batches/latest`)
      .then((res) => res.json())
      .then(setBatches)
      .catch((err) => console.error("Fetch batch summary error:", err));
  }, []);

  return (
    <div className="card shadow-sm h-100 d-flex flex-column">
      <div className="card-header bg-white">
        <h5 className="mb-0">Batch Terbaru</h5>
      </div>
      <div className="card-body p-0">
        <table className="table table-sm mb-0">
          <thead className="table-light">
            <tr>
              <th>ID Batch</th>
              <th>Waktu</th>
              <th>Total Linen</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td>#{batch.id}</td>
                <td>{batch.waktu}</td>
                <td>{batch.totalLinen}</td>
                <td>
                  <span
                    className={`badge ${
                      batch.status === "Keluar"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {batch.status}
                  </span>
                </td>
              </tr>
            ))}
            {batches.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  Tidak ada data batch
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
