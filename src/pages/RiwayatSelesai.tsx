import { useEffect, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import axios from "axios";

// ensure pdfMake has vfs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(pdfMake as any).vfs) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? {};
}

type BatchRow = {
  BATCH_OUT_ID: string;
  Tanggal: string;
  Waktu: string;
  jumlahLinen: number;
};

type DetailRow = {
  LINEN_ID: string;
  LINEN_TYPE: string;
  Status: string;
  LINEN_MAX_CYCLE: string;
  LINEN_TOTAL_WASH: string;
};

export default function RiwayatSelesai() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [selected, setSelected] = useState<{
    b: string;
    t: string;
    w: string;
  } | null>(null);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/batch-list/finished`,
        );
        setBatches(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
      } catch (err) {
        console.error("Gagal mengambil data", err);
      }
    };
    loadBatches();
  }, []);

  async function loadDetails(batchId: string, tanggal: string, waktu: string) {
    try {
      const encBatchID = encodeURIComponent(batchId);
      const endpoint = `/batch-report/finished/${encBatchID}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`);

      if (!res.ok) {
        console.error("Fetch failed:", res.status, await res.text());
        setDetails([]);
        return;
      }

      const rows: DetailRow[] = await res.json();

      if (!Array.isArray(rows)) {
        console.error("Invalid detail data format:", rows);
        setDetails([]);
        return;
      }

      setSelected({ b: batchId, t: tanggal, w: waktu });
      setDetails(rows);
    } catch (err) {
      console.error("Failed to load batch details:", err);
      setDetails([]);
    }
  }

  function handlePrint() {
    if (!selected) return;

    const body = [
      [
        { text: "No", style: "tableHeader" },
        { text: "EPC", style: "tableHeader" },
        { text: "Tipe Linen", style: "tableHeader" },
        { text: "Status", style: "tableHeader" },
        { text: "Max Cycle", style: "tableHeader" },
        { text: "Total Wash", style: "tableHeader" },
      ],
      ...details.map((d, idx) => [
        idx + 1,
        d.LINEN_ID,
        d.LINEN_TYPE,
        (d.Status = "Bersih"),
        d.LINEN_MAX_CYCLE?.toString() ?? "",
        d.LINEN_TOTAL_WASH?.toString() ?? "0",
      ]),
    ];

    const docDefinition = {
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: "RS Cileungsi", style: "mainTitle" },
        {
          text: "Laporan Batch Linen",
          style: "subTitle",
          margin: [0, 2, 0, 2],
        },
        {
          text: `Tanggal : ${selected.t}    Waktu : ${selected.w}\n\n`,
          style: "info",
        },
        {
          table: {
            headerRows: 1,
            widths: [30, "*", 120, 80, 80, 60],
            body,
          },
          layout: "lightHorizontalLines",
        },
        {
          text: `\nTotal Linen : ${details.length}`,
          alignment: "right",
          bold: true,
          margin: [0, 8, 0, 0],
        },
      ],
      styles: {
        mainTitle: {
          fontSize: 18,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 4],
        },
        subTitle: { fontSize: 15, bold: true, alignment: "center" },
        info: { fontSize: 11, alignment: "center", margin: [0, 0, 0, 10] },
        tableHeader: { bold: true, fillColor: "#eeeeee", fontSize: 10 },
      },
      defaultStyle: { fontSize: 9 },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  return (
    <div className="p-4 bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Riwayat Batch Selesai &amp; Cetak PDF
      </h2>

      <div className="mb-6 max-h-[620px] overflow-y-auto rounded-lg">
        <div className="w-full rounded-lg bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-emerald-400/10 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-black/30 sticky top-0 backdrop-blur-md">
                <tr className="text-center">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    BatchID
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Detail
                  </th>
                </tr>
              </thead>

              <tbody>
                {batches.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data
                    </td>
                  </tr>
                )}

                {batches.map(
                  ({ BATCH_OUT_ID, Tanggal, Waktu, jumlahLinen }) => (
                    <tr
                      key={`${BATCH_OUT_ID}-${Tanggal}-${Waktu}`}
                      className="border-b border-gray-200 dark:border-white/10 even:bg-gray-50 dark:even:bg-white/5"
                    >
                      <td className="px-4 py-3">{BATCH_OUT_ID}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {Tanggal}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {Waktu}
                      </td>
                      <td className="px-4 py-3 text-center">{jumlahLinen}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            loadDetails(BATCH_OUT_ID, Tanggal, Waktu)
                          }
                          className="w-full text-sm px-3 py-1 rounded-md bg-emerald-400 text-black font-medium hover:bg-emerald-300 transition"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detail {selected.t} {selected.w}
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelected(null);
                  setDetails([]);
                }}
                className="px-3 py-1 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5 transition"
              >
                Tutup
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1 rounded-md bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition"
              >
                Print / PDF
              </button>
            </div>
          </div>

          <div className="w-full rounded-xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-emerald-400/10 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-black/30 sticky top-0 backdrop-blur-md">
                  <tr className="text-center">
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      No
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 text-left">
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
                  {details.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada detail
                      </td>
                    </tr>
                  )}

                  {details.map((d, idx) => (
                    <tr
                      key={d.LINEN_ID || `${idx}`}
                      className="border-b border-gray-200 dark:border-white/10 even:bg-gray-50 dark:even:bg-white/5"
                    >
                      <td className="px-3 py-2 text-center">{idx + 1}</td>
                      <td className="px-3 py-2 max-w-[260px] break-words">
                        {d.LINEN_ID}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {d.LINEN_TYPE}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        Bersih
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                        {d.LINEN_MAX_CYCLE}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                        {d.LINEN_TOTAL_WASH}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
