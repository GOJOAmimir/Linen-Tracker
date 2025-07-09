// src/pages/BatchInfo.tsx
import { useEffect, useState } from "react";

type BatchListEntry = {
  Tanggal: string;
  Waktu: string;
  jumlahLinen: number;
};

type BatchSummary = {
  TipeLinen: string;
  Jumlah: number;
};

export default function BatchInfo() {
  const [batchList, setBatchList] = useState<BatchListEntry[]>([]);
  const [summaryRows, setSummaryRows] = useState<BatchSummary[]>([]);
  const [selected, setSelected] = useState<{
    tanggal: string;
    waktu: string;
  } | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/batch-list`)
      .then((r) => r.json())
      .then(setBatchList)
      .catch((e) => console.error("fetch /batch-list", e));
  }, []);

  function handleInfo(tanggal: string, waktu: string) {
    const url = `${
      import.meta.env.VITE_API_URL
    }/batch-summary/${encodeURIComponent(tanggal)}/${encodeURIComponent(
      waktu
    )}`;
    fetch(url)
      .then((r) => r.json())
      .then(setSummaryRows)
      .then(() => setSelected({ tanggal, waktu }))
      .catch((e) => console.error("fetch /batch-summary", e));
  }

  return (
    <div>
      <h2 className="mb-3">Informasi Batch</h2>

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
                  className="btn btn-sm btn-info w-100"
                  onClick={() => handleInfo(b.Tanggal, b.Waktu)}
                >
                  Info
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <>
          <h4 className="mt-4">
            Ringkasan Batch&nbsp;
            {selected.tanggal}&nbsp;
            {selected.waktu}
          </h4>

          <table className="table table-bordered table-sm">
            <thead className="table-light">
              <tr>
                <th>Tipe Linen</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center text-muted py-3">
                    Tidak ada data
                  </td>
                </tr>
              )}
              {summaryRows.map((row) => (
                <tr key={row.TipeLinen}>
                  <td>{row.TipeLinen}</td>
                  <td>{row.Jumlah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
