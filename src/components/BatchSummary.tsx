import { useEffect, useState } from "react";
const rowHeight = 28;

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
        <table className="table table-sm mb-0" style={{ fontSize: "0.85rem" }}>
          <thead className="table-light">
            <tr>
              <th style={{ padding: "4px 8px" }}>ID Batch</th>
              <th style={{ padding: "4px 8px" }}>Waktu</th>
              <th style={{ padding: "4px 8px" }}>Total Linen</th>
              <th style={{ padding: "4px 8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} style={{ height: `${rowHeight}px` }}>
                <td style={{ padding: "4px 8px", verticalAlign: "middle" }}>#{batch.id}</td>
                <td style={{ padding: "4px 8px", verticalAlign: "middle" }}>{batch.waktu}</td>
                <td style={{ padding: "4px 8px", verticalAlign: "middle" }}>{batch.totalLinen}</td>
                <td style={{ padding: "4px 8px", verticalAlign: "middle" }}>
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
              <tr style={{ height: `${rowHeight}px` }}>
                <td colSpan={4} className="text-center text-muted" style={{ padding: "4px 8px" }}>
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