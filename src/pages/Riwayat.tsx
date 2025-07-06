/*  ---------------------------------------------------------------
    Riwayat.tsx  –  Laporan & Cetak PDF Batch Linen
    --------------------------------------------------------------- */
import { useEffect, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
if (!(pdfMake as any).vfs) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? {};
}

/* ── 2.  TYPE DEFINITIONS ────────────────────────────────────── */
type BatchRow = {
  Tanggal: string; // ex: 2025‑07‑05
  Waktu: string; // ex: 14:32:15
  jumlahLinen: number;
};

type DetailRow = {
  EPC: string;
  TipeLinen: string;
  OldStatus: string;
  NewStatus: string;
  Antenna: number;
  Type: string;
};

/* ── 3.  COMPONENT ───────────────────────────────────────────── */
export default function Riwayat() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [selected, setSelected] = useState<{ t: string; w: string } | null>(
    null
  );
  const api = "http://localhost:4000";

  /* --- 3A  : ambil daftar batch sekali saat mount -------------- */
  useEffect(() => {
    fetch(`${api}/batch-list`)
      .then((r) => r.json())
      .then(setBatches)
      .catch(console.error);
  }, []);

  /* --- 3B  : ambil detail batch -------------------------------- */
  async function loadDetails(t: string, w: string) {
    try {
      const encT = encodeURIComponent(t);
      const encW = encodeURIComponent(w);
      const res = await fetch(`${api}/batch-report/${encT}/${encW}`);
      const rows: DetailRow[] = await res.json();
      setDetails(rows);
      setSelected({ t, w });
    } catch (err) {
      console.error(err);
    }
  }

  /* --- 3C  : cetak / preview PDF ------------------------------- */
  function handlePrint() {
    if (!selected) return;

    /* body tabel dengan nomor urut */
    const body = [
      [
        { text: "No", style: "tableHeader" },
        { text: "EPC", style: "tableHeader" },
        { text: "Tipe Linen", style: "tableHeader" },
        { text: "Status Awal", style: "tableHeader" },
        { text: "Status Akhir", style: "tableHeader" },
        { text: "Antenna", style: "tableHeader" },
        { text: "Jenis Batch", style: "tableHeader" },
      ],
      ...details.map((d, idx) => [
        idx + 1,
        d.EPC,
        d.TipeLinen,
        d.OldStatus,
        d.NewStatus,
        d.Antenna.toString(),
        d.Type,
      ]),
    ];

    const docDefinition = {
      pageSize: "A4",
      pageOrientation: "potrait",
      pageMargins: [40, 60, 40, 60], // L,T,R,B
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

    pdfMake.createPdf(docDefinition).open(); // .download('laporan.pdf')
  }

  /* ── 4.  RENDER ─────────────────────────────────────────────── */
  return (
    <div>
      <h2 className="mb-3">Riwayat Batch &amp; Cetak PDF</h2>

      {/* --- DAFTAR BATCH --------------------------------------- */}
      <table className="table table-bordered table-hover align-middle">
        <thead className="table-primary text-center">
          <tr>
            <th>Tanggal</th>
            <th>Waktu</th>
            <th>Jumlah Linen</th>
            <th style={{ width: 90 }}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Tidak ada data
              </td>
            </tr>
          )}

          {batches.map((b) => (
            <tr key={`${b.Tanggal}-${b.Waktu}`}>
              <td>{b.Tanggal}</td>
              <td>{b.Waktu}</td>
              <td className="text-center">{b.jumlahLinen}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary w-100"
                  onClick={() => loadDetails(b.Tanggal, b.Waktu)}
                >
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- DETAIL BATCH -------------------------------------- */}
      {selected && (
        <>
          <div className="d-flex justify-content-between align-items-center">
            <h4>
              Detail&nbsp;&nbsp;{selected.t}&nbsp;{selected.w}
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
                <th>Old</th>
                <th>New</th>
                <th>Ant</th>
                <th>Type</th>
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
                <tr key={d.EPC}>
                  <td className="text-center">{idx + 1}</td>
                  <td style={{ maxWidth: 230, wordBreak: "break-all" }}>
                    {d.EPC}
                  </td>
                  <td>{d.TipeLinen}</td>
                  <td>{d.OldStatus}</td>
                  <td>{d.NewStatus}</td>
                  <td className="text-center">{d.Antenna}</td>
                  <td className="text-center">{d.Type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
