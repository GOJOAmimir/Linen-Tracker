// src/pages/BatchSelesaiInfo.tsx
import { useEffect, useMemo, useState } from "react";

type BatchListEntry = {
  batch_id: string;
  status?: string;
  waktu_mulai?: string; // ISO or 'YYYY-MM-DD HH:mm:ss'
  waktu_selesai?: string;
  jumlah?: number;
};

type LinenEntry = {
  LINEN_ID: string;
  LINEN_TYPE?: string;
  LINEN_MAX_CYCLE?: number | null;
  LINEN_TOTAL_WASH?: number | null;
  Status?: string | null;
  tanggal?: string;
};

export default function BatchSelesaiInfo() {
  const [batchList, setBatchList] = useState<BatchListEntry[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [detailRows, setDetailRows] = useState<LinenEntry[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Table controls for details
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch batch list on mount
  useEffect(() => {
    const fetchList = async () => {
      setLoadingBatches(true);
      setBatchError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/batch-status`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // try to normalize data shape: allow array or object.data
        const arr: BatchListEntry[] = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];
        setBatchList(arr);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("fetch /batch-status error:", err);
        setBatchError("Gagal memuat daftar batch");
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchList();
  }, []);

  // handle tombol lihat
  const handleLihat = async (batchId: string) => {
    setSelected(null);
    setDetailRows([]);
    setDetailError(null);
    setLoadingDetails(true);
    setPage(1);

    try {
      // cari status batch di daftar (kalo ada)
      const batchMeta = batchList.find((b) => b.batch_id === batchId);
      const status = (batchMeta?.status ?? "").toString().toLowerCase();

      // susun daftar endpoint nyoba berdasar status
      const enc = encodeURIComponent(batchId);
      const endpoints: string[] = [];

      // kalo status ada dan mengindikasikan finished, prioritaskan finished endpoint
      if (
        status.includes("finish") ||
        status.includes("selesai") ||
        status.includes("finished")
      ) {
        endpoints.push(
          `${import.meta.env.VITE_API_URL}/batch-report/finished/${enc}`,
          `${import.meta.env.VITE_API_URL}/batch-report/${enc}`
        );
      } else {
        // in-progress / registered -> panggil registered endpoint dulu
        endpoints.push(
          `${import.meta.env.VITE_API_URL}/batch-report/registered/${enc}`,
          `${
            import.meta.env.VITE_API_URL
          }/batch-report/registered?batchId=${enc}`,
          // fallback ke generic /batch-report/:id
          `${import.meta.env.VITE_API_URL}/batch-report/${enc}`,
          `${import.meta.env.VITE_API_URL}/batch-report/finished/${enc}`
        );
      }

      endpoints.push(
        `${import.meta.env.VITE_API_URL}/batch-report?batchId=${enc}`,
        `${import.meta.env.VITE_API_URL}/batch-report`
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let rows: any = null;
      for (const url of endpoints) {
        try {
          const r = await fetch(url);
          if (!r.ok) {
            // skip if 404/500 etc
            continue;
          }
          const j = await r.json();
          const candidate = Array.isArray(j)
            ? j
            : Array.isArray(j.data)
            ? j.data
            : Array.isArray(j.rows)
            ? j.rows
            : null;
          if (candidate !== null) {
            if (candidate.length > 0) {
              rows = candidate;
              break;
            } else {
              continue;
            }
          }

          // handle case single object (maybe one record)
          if (j && typeof j === "object" && Object.keys(j).length > 0) {
            if (j.LINEN_ID || j.EPC) {
              rows = [j];
              break;
            }
          }
        } catch (e) {
          // ignore and try next endpoint
          // console.debug(`endpoint ${url} failed:`, e);
          continue;
        }
      }

      if (!rows) {
        throw new Error(
          "Tidak dapat menemukan detail batch pada endpoint yang dicoba."
        );
      }

      // Normalize rows to shape LinenEntry
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized: LinenEntry[] = rows.map((x: any) => ({
        LINEN_ID: x.LINEN_ID ?? x.EPC ?? x.epc ?? x.linen_id ?? "",
        LINEN_TYPE: x.LINEN_TYPE ?? x.Tipe ?? x.tipe ?? x.type ?? "Unknown",
        LINEN_MAX_CYCLE: x.LINEN_MAX_CYCLE ?? x.MaxCuci ?? x.max_cycle ?? null,
        LINEN_TOTAL_WASH:
          x.LINEN_TOTAL_WASH ?? x.LINEN_TOTAL_WASH ?? x.total_wash ?? 0,
        Status: x.Status ?? x.status ?? null,
        tanggal: x.Tanggal ?? x.tanggal ?? undefined,
      }));

      setDetailRows(normalized);
      setSelected(batchId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("fetch /batch-report error:", err);
      setDetailError(err?.message ?? "Gagal memuat detail batch");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Summaries derived from detailRows
  const totalLinen = detailRows.length;
  const summaryByType = useMemo(() => {
    const m = new Map<string, number>();
    detailRows.forEach((r) =>
      m.set(
        r.LINEN_TYPE ?? "Unknown",
        (m.get(r.LINEN_TYPE ?? "Unknown") ?? 0) + 1
      )
    );
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]); // descending
  }, [detailRows]);

  const summaryByStatus = useMemo(() => {
    const m = new Map<string, number>();
    detailRows.forEach((r) => {
      const s = (r.Status ?? "Bersih").toString(); // fallback "Bersih"
      m.set(s, (m.get(s) ?? 0) + 1);
    });
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [detailRows]);

  // Search + pagination
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return detailRows;
    return detailRows.filter(
      (r) =>
        (r.LINEN_ID ?? "").toLowerCase().includes(q) ||
        (r.LINEN_TYPE ?? "").toLowerCase().includes(q)
    );
  }, [detailRows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // Export CSV helper
  const downloadCsv = () => {
    if (detailRows.length === 0) return;
    const header = ["No", "EPC", "Tipe", "Status", "Max Cycle", "Total Wash"];
    const rows = detailRows.map((d, i) => [
      (i + 1).toString(),
      d.LINEN_ID,
      d.LINEN_TYPE ?? "",
      d.Status ?? "",
      d.LINEN_MAX_CYCLE?.toString() ?? "",
      d.LINEN_TOTAL_WASH?.toString() ?? "0",
    ]);
    const csvContent = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-${selected ?? "report"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print printable view
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    const rowsHtml = detailRows
      .map(
        (d, idx) => `
      <tr>
        <td style="padding:6px;border:1px solid #ccc;text-align:center;">${
          idx + 1
        }</td>
        <td style="padding:6px;border:1px solid #ccc;">${d.LINEN_ID}</td>
        <td style="padding:6px;border:1px solid #ccc;">${
          d.LINEN_TYPE ?? ""
        }</td>
        <td style="padding:6px;border:1px solid #ccc;text-align:center;">${
          d.Status ?? ""
        }</td>
        <td style="padding:6px;border:1px solid #ccc;text-align:center;">${
          d.LINEN_MAX_CYCLE ?? ""
        }</td>
        <td style="padding:6px;border:1px solid #ccc;text-align:center;">${
          d.LINEN_TOTAL_WASH ?? 0
        }</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Batch ${selected}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #111 }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 6px; }
            th { background: #f6f6f6; }
            h2 { margin-top: 0; }
          </style>
        </head>
        <body>
          <h2>Batch ${selected}</h2>
          <p>Total linen: ${totalLinen}</p>
          <table>
            <thead>
              <tr>
                <th>No</th><th>EPC</th><th>Tipe</th><th>Status</th><th>Max Cycle</th><th>Total Wash</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Helper to format datetime & compute duration
  const formatDateTime = (s?: string) => {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString();
  };
  const computeDuration = (start?: string, end?: string) => {
    if (!start) return "-";
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "-";
    const diff = Math.max(0, e.getTime() - s.getTime());
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const remMin = mins % 60;
    return `${hrs}h ${remMin}m`;
  };

  return (
    <div className="container-fluid mt-3">
      <h2 className="mb-3">Informasi Batch</h2>

      <div className="row g-3">
        {/* LEFT: batch list */}
        <div className="col-lg-4">
          <div
            className="surface p-2 d-flex flex-column"
            style={{
              height: 760,
              minHeight: 0,
            }}
          >
            {/* header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Daftar Batch</h6>
              <small className="text-muted">{batchList.length} items</small>
            </div>

            {/* loading / error */}
            {loadingBatches && (
              <div className="text-center py-3">Memuat batch...</div>
            )}
            {batchError && (
              <div className="alert alert-warning py-1">{batchError}</div>
            )}

            {/* area tabel: ambil ruang tersisa dan scroll jika overflow */}
            <div
              className="table-responsive flex-grow-1"
              style={{ minHeight: 0, overflowY: "auto" }}
            >
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>BatchID</th>
                    <th className="text-center">Status</th>
                    <th className="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {batchList.length === 0 && !loadingBatches && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-3">
                        Tidak ada batch
                      </td>
                    </tr>
                  )}
                  {batchList.map((b) => (
                    <tr
                      key={b.batch_id}
                      className={
                        selected === b.batch_id ? "table-primary" : undefined
                      }
                    >
                      <td style={{ maxWidth: 180, wordBreak: "break-word" }}>
                        {b.batch_id}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark">
                          {b.status ?? "-"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleLihat(b.batch_id)}
                          >
                            Lihat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* optional footer: berada di paling bawah kartu */}
            <div className="mt-2 text-end small text-muted">
              Total: <strong>{batchList.length}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT: detail panel */}
        <div className="col-lg-8">
          {!selected && (
            <div className="surface p-4 text-center">
              <p className="mb-0 text-muted">
                Pilih sebuah batch di kiri untuk melihat detail ringkas.
              </p>
            </div>
          )}

          {selected && (
            <div className="surface p-3">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="mb-1">
                    Batch <strong>{selected}</strong>
                  </h5>
                  <div className="small text-muted">
                    Mulai:{" "}
                    {formatDateTime(
                      batchList.find((b) => b.batch_id === selected)
                        ?.waktu_mulai
                    )}
                    {" • "}
                    Selesai:{" "}
                    {formatDateTime(
                      batchList.find((b) => b.batch_id === selected)
                        ?.waktu_selesai ?? undefined
                    )}
                    {" • "}
                    Durasi:{" "}
                    {computeDuration(
                      batchList.find((b) => b.batch_id === selected)
                        ?.waktu_mulai,
                      batchList.find((b) => b.batch_id === selected)
                        ?.waktu_selesai
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSelected(null);
                      setDetailRows([]);
                    }}
                  >
                    Tutup
                  </button>
                  <button
                    className="btn btn-outline-success"
                    onClick={downloadCsv}
                    disabled={detailRows.length === 0}
                  >
                    Export CSV
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handlePrint}
                    disabled={detailRows.length === 0}
                  >
                    Print
                  </button>
                </div>
              </div>

              {/* Summary tiles: total and counts */}
              <div className="d-flex gap-3 flex-wrap mb-3">
                <div
                  className="p-3 border rounded text-center"
                  style={{ minWidth: 140 }}
                >
                  <div className="small text-muted">Total Linen</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {totalLinen}
                  </div>
                </div>

                <div className="p-3 border rounded" style={{ minWidth: 160 }}>
                  <div className="small text-muted">Per Tipe (top 3)</div>
                  <div>
                    {summaryByType.slice(0, 3).map(([t, cnt]) => (
                      <div key={t} className="d-flex justify-content-between">
                        <div style={{ fontSize: 13 }}>{t}</div>
                        <div className="text-muted">{cnt}</div>
                      </div>
                    ))}
                    {summaryByType.length === 0 && (
                      <div className="text-muted small">Tidak ada data</div>
                    )}
                  </div>
                </div>

                <div className="p-3 border rounded" style={{ minWidth: 160 }}>
                  <div className="small text-muted">Status</div>
                  <div>
                    {summaryByStatus.map(([s, cnt]) => (
                      <div key={s} className="d-flex justify-content-between">
                        <div style={{ fontSize: 13 }}>{s}</div>
                        <div className="text-muted">{cnt}</div>
                      </div>
                    ))}
                    {summaryByStatus.length === 0 && (
                      <div className="text-muted small">Tidak ada data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search + Table */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="input-group" style={{ maxWidth: 360 }}>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Cari EPC atau tipe..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="small text-muted">
                  Menampilkan {filteredRows.length} hasil
                </div>
              </div>

              {loadingDetails && (
                <div className="text-center py-3">Memuat detail...</div>
              )}
              {detailError && (
                <div className="alert alert-warning py-1">{detailError}</div>
              )}

              <div style={{ maxHeight: 380, overflowY: "auto" }}>
                <table className="table table-sm table-striped align-middle mb-0">
                  <thead className="table-light small text-center">
                    <tr>
                      <th style={{ width: 48 }}>No</th>
                      <th style={{ minWidth: 180 }}>EPC</th>
                      <th>Tipe</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Max Cycle</th>
                      <th className="text-center">Total Wash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.length === 0 && !loadingDetails ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-3">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map((d, idx) => (
                        <tr key={d.LINEN_ID || `${idx}`}>
                          <td className="text-center">
                            {(page - 1) * pageSize + idx + 1}
                          </td>
                          <td
                            style={{ maxWidth: 260, wordBreak: "break-word" }}
                          >
                            {d.LINEN_ID}
                          </td>
                          <td>{d.LINEN_TYPE}</td>
                          <td className="text-center">
                            {d.Status ?? "Bersih"}
                          </td>
                          <td className="text-center">
                            {d.LINEN_MAX_CYCLE ?? "-"}
                          </td>
                          <td className="text-center">
                            {d.LINEN_TOTAL_WASH ?? 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div className="small text-muted">
                  Page {page} / {totalPages}
                </div>
                <div>
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
