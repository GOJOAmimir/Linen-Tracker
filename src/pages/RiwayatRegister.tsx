import { useEffect, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import axios from "axios";

if (!(pdfMake as any).vfs) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? {};
}

type BatchRow = {
  BATCH_IN_ID: string;
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

export default function RiwayatRegister() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [selected, setSelected] = useState<{
    b: string;
    t: string;
    w: string;
  } | null>(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/batch-list/registered`)
      .then((res) => setBatches(res.data ?? []))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  async function loadDetails(batchId: string, tanggal: string, waktu: string) {
    try {
      const enc = encodeURIComponent(batchId);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/batch-report/registered/${enc}`,
      );

      if (!Array.isArray(res.data)) {
        setDetails([]);
        return;
      }

      setSelected({ b: batchId, t: tanggal, w: waktu });
      setDetails(res.data);
    } catch (err) {
      console.error("Load detail error:", err);
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
      ...details.map((d, i) => [
        i + 1,
        d.LINEN_ID,
        d.LINEN_TYPE,
        "Dicuci",
        d.LINEN_MAX_CYCLE,
        d.LINEN_TOTAL_WASH,
      ]),
    ];

    pdfMake
      .createPdf({
        pageSize: "A4",
        pageOrientation: "landscape",
        content: [
          { text: "RS Cileungsi", style: "mainTitle" },
          { text: "Laporan Batch Linen", style: "subTitle" },
          {
            text: `Tanggal : ${selected.t}   Waktu : ${selected.w}\n\n`,
            style: "info",
          },
          {
            table: {
              headerRows: 1,
              widths: [30, "*", 90, 70, 70, 70],
              body,
            },
          },
        ],
        styles: {
          mainTitle: { fontSize: 18, bold: true, alignment: "center" },
          subTitle: { fontSize: 14, bold: true, alignment: "center" },
          info: { fontSize: 11, alignment: "center" },
          tableHeader: { bold: true, fillColor: "#eeeeee" },
        },
      })
      .open();
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Riwayat Batch Registered & Cetak PDF
      </h2>

      {/* BATCH LIST */}
      <div className="mb-6 max-h-[620px] overflow-y-auto">
        <div className="rounded-xl bg-white/5 backdrop-blur-md border border-emerald-400/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-black/40 backdrop-blur-md">
                <tr className="text-center">
                  {["BatchID", "Tanggal", "Waktu", "Jumlah", "Detail"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold text-gray-300"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {batches.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      Tidak ada data
                    </td>
                  </tr>
                )}

                {batches.map((b) => (
                  <tr
                    key={`${b.BATCH_IN_ID}-${b.Tanggal}-${b.Waktu}`}
                    className="border-b border-white/10 even:bg-white/5 hover:bg-white/10 transition"
                  >
                    <td className="px-4 py-3 text-gray-100">{b.BATCH_IN_ID}</td>
                    <td className="px-4 py-3 text-gray-200">{b.Tanggal}</td>
                    <td className="px-4 py-3 text-gray-200">{b.Waktu}</td>
                    <td className="px-4 py-3 text-center text-gray-100">
                      {b.jumlahLinen}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          loadDetails(b.BATCH_IN_ID, b.Tanggal, b.Waktu)
                        }
                        className="w-full text-sm px-3 py-1 rounded-md bg-emerald-400 text-black font-medium hover:bg-emerald-300 transition"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL */}
      {selected && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white">
              Detail {selected.t} {selected.w}
            </h4>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-md bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition"
            >
              Print / PDF
            </button>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-md border border-emerald-400/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-black/40 backdrop-blur-md">
                  <tr className="text-center">
                    {[
                      "No",
                      "EPC",
                      "Tipe",
                      "Status",
                      "Max Cycle",
                      "Total Wash",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-xs uppercase font-semibold text-gray-300"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {details.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-gray-400"
                      >
                        Tidak ada detail
                      </td>
                    </tr>
                  )}

                  {details.map((d, i) => (
                    <tr
                      key={d.LINEN_ID}
                      className="border-b border-white/10 even:bg-white/5"
                    >
                      <td className="px-3 py-2 text-center text-gray-100">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 max-w-[260px] break-words text-gray-100">
                        {d.LINEN_ID}
                      </td>
                      <td className="px-3 py-2 text-gray-200">
                        {d.LINEN_TYPE}
                      </td>
                      <td className="px-3 py-2 text-gray-200">Dicuci</td>
                      <td className="px-3 py-2 text-center text-gray-200">
                        {d.LINEN_MAX_CYCLE}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-200">
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
