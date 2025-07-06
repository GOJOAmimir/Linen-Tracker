import { useEffect, useState } from "react";

type BatchListEntry = {
  Tanggal: string;
  Waktu: string;
  jumlahLinen: number;
};

type LinenEntry = {
  EPC: string;
  TipeLinen: string;
  OldStatus: string;
  NewStatus: string;
  Antenna: number;
  Type: string;
};

export default function BatchReport() {
  const [batchList, setBatchList] = useState<BatchListEntry[]>([]);
  const [detailRows, setDetailRows] = useState<LinenEntry[]>([]);
  const [selected, setSelected] = useState<{
    tanggal: string;
    waktu: string;
  } | null>(null);

  /* ---------- ambil daftar batch saat mount ---------- */
  useEffect(() => {
    fetch("http://localhost:4000/batch-list")
      .then((r) => r.json())
      .then(setBatchList)
      .catch((e) => console.error("fetch /batch-list", e));
  }, []);

  /* ---------- klik tombol Lihat ---------- */
  function handleLihat(tgl: string, wkt: string) {
    const url = `http://localhost:4000/batch-report/${encodeURIComponent(
      tgl
    )}/${encodeURIComponent(wkt)}`;

    fetch(url)
      .then((r) => r.json())
      .then((rows) => {
        setDetailRows(rows);
        setSelected({ tanggal: tgl, waktu: wkt });
      })
      .catch((e) => console.error("fetch /batch-report", e));
  }

  return (
    <div>
      <h2 className="mb-3">Informasi Batch</h2>

      {/* ---------- tabel daftar batch ---------- */}
      <table className="table table-bordered table-hover align-middle">
        <thead className="table-primary text-center">
          <tr>
            <th>Tanggal</th>
            <th>Waktu</th>
            <th>Jumlah Linen</th>
            <th style={{ width: 90 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {batchList.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Tidak ada batch.
              </td>
            </tr>
          )}

          {batchList.map((b) => (
            <tr key={`${b.Tanggal}-${b.Waktu}`}>
              <td>{b.Tanggal}</td>
              <td>{b.Waktu}</td>
              <td className="text-center">{b.jumlahLinen}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary w-100"
                  onClick={() => handleLihat(b.Tanggal, b.Waktu)}
                >
                  Lihat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------- detail batch ---------- */}
      {selected && (
        <>
          <h4 className="mt-4">
            Detail Batch&nbsp;{selected.tanggal}&nbsp;{selected.waktu}
          </h4>

          <table className="table table-sm table-bordered table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>EPC</th>
                <th>Tipe Linen</th>
                <th>Old Status</th>
                <th>New Status</th>
                <th className="text-center">Ant</th>
                <th className="text-center">Tipe Batch</th>
              </tr>
            </thead>
            <tbody>
              {detailRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    Tidak ada data
                  </td>
                </tr>
              )}

              {detailRows.map((row) => (
                <tr key={row.EPC}>
                  <td style={{ maxWidth: 240, wordBreak: "break-all" }}>
                    {row.EPC}
                  </td>
                  <td>{row.TipeLinen}</td>
                  <td>{row.OldStatus}</td>
                  <td>{row.NewStatus}</td>
                  <td className="text-center">{row.Antenna}</td>
                  <td className="text-center">{row.Type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
