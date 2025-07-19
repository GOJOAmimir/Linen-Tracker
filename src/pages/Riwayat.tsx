import { useEffect, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

if (!(pdfMake as any).vfs) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? {};
}

type BatchRow = {
  Tanggal: string;
  Waktu: string;
  jumlahLinen: number;
  batchType: string;
};

type DetailRow = {
  EPC: string;
  TipeLinen: string;
  OldStatus: string;
  NewStatus: string;
  Antenna: number;
  Type: string;
  batchType: string;
};

export default function Riwayat() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [selected, setSelected] = useState<{ t: string; w: string; type: string } | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/batch-list`)
      .then((r) => r.json())
      .then(setBatches)
      .catch(console.error);
  }, []);

  async function loadDetails(t: string, w: string, type: string) {
  try {
    const encT = encodeURIComponent(t);
    const encW = encodeURIComponent(w);

    const endpoint = type === "Dicuci"
      ? `/batch-report-in/${encT}/${encW}`
      : `/batch-report-out/${encT}/${encW}`;

    const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`);
    const rows: DetailRow[] = await res.json();
    setDetails(rows);
    setSelected({ t, w, type }); // simpan dengan tipe yang dipilih
  } catch (err) {
    console.error(err);
  }
}


  function handlePrint() {
    if (!selected) return;

    const body = [
      [
        { text: "No", style: "tableHeader" },
        { text: "EPC", style: "tableHeader" },
        { text: "Tipe Linen", style: "tableHeader" },
        { text: "Status Awal", style: "tableHeader" },
        { text: "Status Akhir", style: "tableHeader" },
        { text: "Antenna", style: "tableHeader" },
        { text: "Status", style: "tableHeader" },
      ],
      ...details.map((d, idx) => [
        idx + 1,
        d.EPC,
        d.TipeLinen,
        d.OldStatus,
        d.NewStatus,
        d.Antenna.toString(),
        d.batchType,
      ]),
    ];

    const docDefinition = {
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: "RS Cileungsi", style: "mainTitle" },
        { text: "Laporan Batch Linen", style: "subTitle", margin: [0, 2, 0, 2] },
        {
          text: `Tanggal : ${selected.t}    Waktu : ${selected.w}    Jenis : ${selected.type}\n\n`,
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
        mainTitle: { fontSize: 18, bold: true, alignment: "center", margin: [0, 0, 0, 4] },
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
      <h2 className="mb-3">Riwayat Batch &amp; Cetak PDF</h2>

      {/* Daftar batch */}
      <div style={{ maxHeight: 620, overflowY: "auto" }} className="mb-4">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-primary text-center">
            <tr>
              <th>Tanggal</th>
              <th>Waktu</th>
              <th>Jumlah</th>
              <th>Status</th>
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
            {batches.map((b) => (
              <tr key={`${b.Tanggal}-${b.Waktu}-${b.batchType}`}>
                <td>{b.Tanggal}</td>
                <td>{b.Waktu}</td>
                <td className="text-center">{b.jumlahLinen}</td>
                <td className="text-center">{b.batchType}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary w-100"
                    onClick={() => loadDetails(b.Tanggal, b.Waktu, b.batchType)}
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
              Detail {selected.t} {selected.w} ({selected.type})
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
                <th>Status</th>
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
                  <td style={{ maxWidth: 230, wordBreak: "break-word" }}>{d.EPC}</td>
                  <td>{d.TipeLinen}</td>
                  <td>{d.OldStatus}</td>
                  <td>{d.NewStatus}</td>
                  <td className="text-center">{d.Antenna}</td>
                  <td className="text-center">{d.batchType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
