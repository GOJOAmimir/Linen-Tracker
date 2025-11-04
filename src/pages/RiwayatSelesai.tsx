import { useEffect, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import axios from "axios";

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
      try{
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/batch-list/finished`)
        setBatches(res.data);
      }catch(err){
        console.error("Gagal mengmabil data", err)
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
        d.LINEN_MAX_CYCLE.toString(),
        d.LINEN_TOTAL_WASH.toString(),
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
            widths: [30, "*", 80, 70, 80, 45, 65],
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
    <div>
      <h2 className="mb-3">Riwayat Batch Selesai &amp; Cetak PDF</h2>

      {/* Daftar batch */}
      <div style={{ maxHeight: 620, overflowY: "auto" }} className="mb-4">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-primary text-center">
            <tr>
              <th>BatchID</th>
              <th>Tanggal</th>
              <th>Waktu</th>
              <th>Jumlah</th>
              <th style={{ width: 90 }}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  Tidak ada data
                </td>
              </tr>
            )}
            {batches.map(({ BATCH_OUT_ID, Tanggal, Waktu, jumlahLinen }) => (
              <tr key={`${BATCH_OUT_ID}-${Tanggal}-${Waktu}`}>
                <td>{BATCH_OUT_ID}</td>
                <td>{Tanggal}</td>
                <td>{Waktu}</td>
                <td className="text-center">{jumlahLinen}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary w-100"
                    onClick={() => loadDetails(BATCH_OUT_ID, Tanggal, Waktu)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail batch */}
      {selected && (
        <>
          <div className="d-flex justify-content-between align-items-center">
            <h4>
              Detail {selected.t} {selected.w}
            </h4>
            <button className="btn btn-success" onClick={handlePrint}>
              Print / PDF
            </button>
          </div>

          <table className="table table-sm table-bordered table-striped align-middle mt-2">
            <thead className="table-light text-center">
              <tr>
                <th>No</th>
                <th>EPC</th>
                <th>Tipe</th>
                <th>Status</th>
                <th>Max Cycle</th>
                <th>Total Wash</th>
              </tr>
            </thead>
            <tbody>
              {details.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    Tidak ada detail
                  </td>
                </tr>
              )}
              {details.map((d, idx) => (
                <tr key={d.LINEN_ID}>
                  <td className="text-center">{idx + 1}</td>
                  <td style={{ maxWidth: 230, wordBreak: "break-word" }}>
                    {d.LINEN_ID}
                  </td>
                  <td>{d.LINEN_TYPE}</td>
                  <td>{(d.Status = "Bersih")}</td>
                  <td className="text-center">{d.LINEN_MAX_CYCLE}</td>
                  <td className="text-center">{d.LINEN_TOTAL_WASH}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
