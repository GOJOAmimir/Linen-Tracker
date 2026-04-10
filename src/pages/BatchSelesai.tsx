import { useEffect, useMemo, useState } from "react";

type BatchListEntry = {
  batch_id: string;
  status?: string;
  waktu_mulai?: string;
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
        const arr: BatchListEntry[] = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
            ? json.data
            : [];
        setBatchList(arr);
      } catch (err: unknown) {
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
      const batchMeta = batchList.find((b) => b.batch_id === batchId);
      const status = (batchMeta?.status ?? "").toString().toLowerCase();

      const enc = encodeURIComponent(batchId);
      const endpoints: string[] = [];

      if (
        status.includes("finish") ||
        status.includes("selesai") ||
        status.includes("finished")
      ) {
        endpoints.push(
          `${import.meta.env.VITE_API_URL}/batch-report/finished/${enc}`,
          `${import.meta.env.VITE_API_URL}/batch-report/${enc}`,
        );
      } else {
        endpoints.push(
          `${import.meta.env.VITE_API_URL}/batch-report/registered/${enc}`,
          `${import.meta.env.VITE_API_URL}/batch-report/registered?batchId=${enc}`,
          `${import.meta.env.VITE_API_URL}/batch-report/${enc}`,
          `${import.meta.env.VITE_API_URL}/batch-report/finished/${enc}`,
        );
      }

      endpoints.push(
        `${import.meta.env.VITE_API_URL}/batch-report?batchId=${enc}`,
        `${import.meta.env.VITE_API_URL}/batch-report`,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let rows: any = null;
      for (const url of endpoints) {
        try {
          const r = await fetch(url);
          if (!r.ok) continue;
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

          if (j && typeof j === "object" && Object.keys(j).length > 0) {
            if (j.LINEN_ID || j.EPC) {
              rows = [j];
              break;
            }
          }
        } catch {
          continue;
        }
      }

      if (!rows) {
        throw new Error(
          "Tidak dapat menemukan detail batch pada endpoint yang dicoba.",
        );
      }

      // Normalize rows to shape LinenEntry
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized: LinenEntry[] = rows.map((x: any) => ({
        LINEN_ID: x.LINEN_ID ?? x.EPC ?? x.epc ?? x.linen_id ?? "",
        LINEN_TYPE:
          x.LINEN_TYPE ??
          x.Tipe ??
          x.tipe ??
          x.type ??
          x.LINEN_TYPE ??
          "Unknown",
        LINEN_MAX_CYCLE: x.LINEN_MAX_CYCLE ?? x.MaxCuci ?? x.max_cycle ?? null,
        LINEN_TOTAL_WASH:
          x.LINEN_TOTAL_WASH ?? x.LINEN_TOTAL_WASH ?? x.total_wash ?? 0,
        Status: x.Status ?? x.status ?? null,
        tanggal: x.Tanggal ?? x.tanggal ?? undefined,
      }));

      setDetailRows(normalized);
      setSelected(batchId);
    } catch (err: unknown) {
      console.error("fetch /batch-report error:", err);
      setDetailError(err instanceof Error ? err.message : "Gagal memuat detail batch");
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
        (m.get(r.LINEN_TYPE ?? "Unknown") ?? 0) + 1,
      ),
    );
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]); // descending
  }, [detailRows]);

  const summaryByStatus = useMemo(() => {
    const m = new Map<string, number>();
    detailRows.forEach((r) => {
      const s = (r.Status ?? "Bersih").toString();
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
        (r.LINEN_TYPE ?? "").toLowerCase().includes(q),
    );
  }, [detailRows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // Print printable view
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    const rowsHtml = detailRows
      .map(
        (d, idx) => `
      <tr>
        <td style="padding:6px;border:1px solid #ccc;text-align:center;">${idx + 1}</td>
        <td style="padding:6px;border:1px solid #ccc;">${d.LINEN_ID}</td>
        <td style="padding:6px;border:1px solid #ccc;">${d.LINEN_TYPE ?? ""}</td>
        <td style="padding:6px;border:1px solid #ccc;text-align:center;">${d.Status ?? ""}</td>
        <td style="padding:6px;border:1px solid #ccc;text-align:center;">${d.LINEN_MAX_CYCLE ?? ""}</td>
        <td style="padding:6px;border:1px solid #ccc;text-align:center;">${d.LINEN_TOTAL_WASH ?? 0}</td>
      </tr>
    `,
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
    <div className="p-4 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Informasi Batch
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: batch list */}
        <div className="lg:col-span-4">
          <div
            className="flex flex-col bg-white dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200 dark:border-emerald-400/10 h-[760px] overflow-hidden"
            role="region"
            aria-label="Daftar Batch"
          >
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <div>
                <h6 className="font-medium text-gray-900 dark:text-white">
                  Daftar Batch
                </h6>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {batchList.length} items
                </div>
              </div>
            </div>

            {/* loading / error */}
            <div className="px-4 py-2">
              {loadingBatches && (
                <div className="text-center py-3 text-gray-600 dark:text-gray-300">
                  Memuat batch...
                </div>
              )}
              {batchError && (
                <div className="bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/20 rounded-md px-3 py-2 text-sm">
                  {batchError}
                </div>
              )}
            </div>

            {/* area tabel: ambil ruang tersisa dan scroll jika overflow */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 dark:bg-black/25 backdrop-blur-md">
                  <tr className="text-left">
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      BatchID
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                      Status
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {batchList.length === 0 && !loadingBatches && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-6 text-center text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada batch
                      </td>
                    </tr>
                  )}

                  {batchList.map((b) => (
                    <tr
                      key={b.batch_id}
                      className={`border-b border-gray-200 dark:border-white/10 ${
                        selected === b.batch_id
                          ? "bg-emerald-100 dark:bg-emerald-600/10"
                          : "even:bg-gray-50 dark:even:bg-white/5"
                      }`}
                    >
                      <td className="px-3 py-3 max-w-[180px] break-words text-gray-900 dark:text-gray-100">
                        {b.batch_id}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-200">
                          {b.status ?? "-"}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleLihat(b.batch_id)}
                            className="text-sm px-3 py-1 rounded-md border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-600/10 transition"
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

            <div className="px-4 py-3 text-right text-xs text-gray-600 dark:text-gray-300">
              Total:{" "}
              <strong className="text-gray-900 dark:text-white">
                {batchList.length}
              </strong>
            </div>
          </div>
        </div>

        {/* RIGHT: detail panel */}
        <div className="lg:col-span-8">
          {!selected && (
            <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200 dark:border-emerald-400/10 p-6">
              <p className="mb-0 text-gray-600 dark:text-gray-300 text-center">
                Pilih sebuah batch di kiri untuk melihat detail ringkas.
              </p>
            </div>
          )}

          {selected && (
            <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200 dark:border-emerald-400/10 p-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                <div>
                  <h5 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
                    Batch <strong>{selected}</strong>
                  </h5>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Mulai:{" "}
                    {formatDateTime(
                      batchList.find((b) => b.batch_id === selected)
                        ?.waktu_mulai,
                    )}
                    {" • "}Selesai:{" "}
                    {formatDateTime(
                      batchList.find((b) => b.batch_id === selected)
                        ?.waktu_selesai ?? undefined,
                    )}
                    {" • "}Durasi:{" "}
                    {computeDuration(
                      batchList.find((b) => b.batch_id === selected)
                        ?.waktu_mulai,
                      batchList.find((b) => b.batch_id === selected)
                        ?.waktu_selesai,
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                    onClick={() => {
                      setSelected(null);
                      setDetailRows([]);
                    }}
                  >
                    Tutup
                  </button>

                  <button
                    className={`px-3 py-1 rounded-md font-semibold transition ${
                      detailRows.length === 0
                        ? "bg-emerald-400/30 text-black cursor-not-allowed"
                        : "bg-emerald-400 text-black hover:bg-emerald-300"
                    }`}
                    onClick={handlePrint}
                    disabled={detailRows.length === 0}
                  >
                    Print
                  </button>
                </div>
              </div>

              {/* Summary tiles: total and counts */}
              <div className="flex flex-wrap gap-3 mb-3">
                <div className="flex-1 min-w-[140px] bg-gray-100 dark:bg-white/6 border border-gray-200 dark:border-white/6 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Total Linen
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {totalLinen}
                  </div>
                </div>

                <div className="min-w-[160px] bg-gray-100 dark:bg-white/6 border border-gray-200 dark:border-white/6 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Per Tipe (top 3)
                  </div>
                  <div className="mt-2 space-y-1">
                    {summaryByType.slice(0, 3).map(([t, cnt]) => (
                      <div key={t} className="flex justify-between text-sm">
                        <div className="text-gray-900 dark:text-gray-100">
                          {t}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          {cnt}
                        </div>
                      </div>
                    ))}
                    {summaryByType.length === 0 && (
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        Tidak ada data
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-[160px] bg-gray-100 dark:bg-white/6 border border-gray-200 dark:border-white/6 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Status
                  </div>
                  <div className="mt-2 space-y-1">
                    {summaryByStatus.map(([s, cnt]) => (
                      <div key={s} className="flex justify-between text-sm">
                        <div className="text-gray-900 dark:text-gray-100">
                          {s}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          {cnt}
                        </div>
                      </div>
                    ))}
                    {summaryByStatus.length === 0 && (
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        Tidak ada data
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search + Table */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                <div className="w-full sm:w-auto">
                  <input
                    className="w-full sm:w-[360px] bg-white dark:bg-transparent border border-gray-300 dark:border-white/10 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 focus:border-emerald-400/50"
                    placeholder="Cari EPC atau tipe..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Menampilkan{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {filteredRows.length}
                  </strong>{" "}
                  hasil
                </div>
              </div>

              {loadingDetails && (
                <div className="text-center py-3 text-gray-600 dark:text-gray-300">
                  Memuat detail...
                </div>
              )}
              {detailError && (
                <div className="bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/20 rounded-md px-3 py-2 text-sm mb-2">
                  {detailError}
                </div>
              )}

              <div className="max-h-[380px] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-gray-100 dark:bg-black/25 backdrop-blur-md">
                    <tr className="text-center">
                      <th
                        className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                        style={{ width: 48 }}
                      >
                        No
                      </th>
                      <th
                        className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                        style={{ minWidth: 180 }}
                      >
                        EPC
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Tipe
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Max Cycle
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Total Wash
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedRows.length === 0 && !loadingDetails ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-6 text-center text-gray-500 dark:text-gray-400"
                        >
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map((d, idx) => (
                        <tr
                          key={d.LINEN_ID || `${idx}`}
                          className="border-b border-gray-200 dark:border-white/10 even:bg-gray-50 dark:even:bg-white/5"
                        >
                          <td className="px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                            {(page - 1) * pageSize + idx + 1}
                          </td>
                          <td className="px-3 py-2 break-words max-w-[260px] text-gray-900 dark:text-gray-100">
                            {d.LINEN_ID}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                            {d.LINEN_TYPE}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                            {d.Status ?? "Bersih"}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                            {d.LINEN_MAX_CYCLE ?? "-"}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                            {d.LINEN_TOTAL_WASH ?? 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between gap-3 mt-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Page {page} / {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className={`px-3 py-1 rounded-md border text-sm transition ${
                      page <= 1
                        ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-white/5"
                        : "border-gray-300 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    Prev
                  </button>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className={`px-3 py-1 rounded-md border text-sm transition ${
                      page >= totalPages
                        ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-white/5"
                        : "border-gray-300 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
