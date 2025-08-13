import { useEffect, useState } from "react";

type BatchListEntry = {
  batch_id: string;
  status: string;
  waktu_mulai: string;
  waktu_selesai: string;
};

type LinenEntry = {
  LINEN_ID: string;
  LINEN_TYPE: string;
  tanggal: string;
  Status: string;
};

export default function BatchSelesaiInfo() {
  const [batchList, setBatchList] = useState<BatchListEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detailRows, setDetailRows] = useState<LinenEntry[]>([]);

  // Fetch batch list
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/batch-status`)
      .then((r) => r.json())
      .then((data) => setBatchList(data.slice(0, 12)))
      .catch((e) => console.error("fetch /batch-list", e));
  }, []);

  const handleLihat = (BATCH_OUT_ID: string) => {
    const url = `${
      import.meta.env.VITE_API_URL
    }/batch-report/${encodeURIComponent(BATCH_OUT_ID)}`;

    fetch(url)
      .then((r) => r.json())
      .then((rows) => {
        setSelected(BATCH_OUT_ID);
        setDetailRows(rows);
      })
      .catch((e) => console.error("fetch /batch-report", e));
  };

  const getTipeSummary = (): Record<string, number> => {
    const result: Record<string, number> = {};
    detailRows.forEach((r) => {
      result[r.LINEN_TYPE] = (result[r.LINEN_TYPE] || 0) + 1;
    });
    return result;
  };

  const getStatusTransisiSummary = (): Record<string, number> => {
    const result: Record<string, number> = {};
    detailRows.forEach((r) => {
      const key = `DICUCI → BERSIH`;
      result[key] = (result[key] || 0) + 1;
    });
    return result;
  };

  return (
    <div className="container-fluid mt-3">
      <h2 className="mb-3">Informasi Batch</h2>

      {/* Tabel daftar batch dengan scroll */}
      <div style={{ maxHeight: 350, overflowY: "auto" }} className="mb-4">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-primary text-center">
            <tr>
              <th>Batch ID</th>
              <th>Waktu Mulai</th>
              <th>Waktu Selesai</th>
              <th>Status</th>
              <th style={{ width: 90 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {batchList.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  Tidak ada batch.
                </td>
              </tr>
            )}
            {batchList.map((b) => (
              <tr key={b.batch_id}>
                <td>{b.batch_id}</td>
                <td>{b.waktu_mulai}</td>
                <td>{b.waktu_selesai}</td>
                <td className="text-center">{b.status}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary w-100"
                    onClick={() => handleLihat(b.batch_id)}
                  >
                    Lihat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail batch */}
      {selected && (
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <strong>Batch {selected}</strong>
          </div>
          <div className="card-body">
            {/* Ringkasan tipe linen */}
            <h6 className="mb-3">Total Linen per Tipe</h6>
            <div className="d-flex flex-wrap gap-3 mb-4">
              {Object.entries(getTipeSummary()).map(([tipe, jumlah]) => (
                <div
                  key={tipe}
                  className="border rounded p-2 px-3 shadow-sm bg-light text-dark"
                >
                  <strong>{tipe}</strong> <br />
                  <span className="fs-5">{jumlah}</span>
                </div>
              ))}
              {Object.keys(getTipeSummary()).length === 0 && (
                <div className="text-muted">Tidak ada data</div>
              )}
            </div>

            {/* Ringkasan status */}
            <h6 className="mb-3">Status Linen</h6>
            <ul className="list-group list-group-flush">
              {Object.entries(getStatusTransisiSummary()).map(
                ([status, count]) => (
                  <li
                    key={status}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <span>{status}</span>
                    <span className="badge bg-secondary">{count}</span>
                  </li>
                )
              )}
              {Object.keys(getStatusTransisiSummary()).length === 0 && (
                <li className="list-group-item text-muted">Tidak ada data</li>
              )}
            </ul>

            {/* Total linen */}
            <p className="mt-4 text-end text-muted small">
              Total linen dalam batch ini: <strong>{detailRows.length}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
