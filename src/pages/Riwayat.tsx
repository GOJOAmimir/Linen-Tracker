import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;


interface BatchRow {
  tanggal: string;
  waktu: string;
  total: number;
  batchType: string;
}

interface DetailRow {
  uid: string;
  linen: string;
  status: string;
  antenna: number;
  waktu: string;
}

export default function Riwayat() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [selected, setSelected] = useState<{
    t: string;
    w: string;
    type: string;
  } | null>(null);

  // Ambil daftar batch
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/batch-list`)
      .then((r) => r.json())
      .then(setBatches)
      .catch(console.error);
  }, []);

  // Ambil detail untuk batch tertentu
  async function loadDetails(t: string, w: string, type: string) {
  try {
    const encT = encodeURIComponent(t);     // Tanggal (format: YYYY-MM-DD)
    const encW = encodeURIComponent(w);     // Waktu (format: HH:mm:ss)
    const encType = encodeURIComponent(type); // Batch type (Dicuci atau Keluar)

    const endpoint = `/batch-report/${encT}/${encW}/${encType}`;
    const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`);

    const rows = await res.json();

    if (!Array.isArray(rows)) {
      console.error("Invalid detail data:", rows);
      setDetails([]);
      return;
    }

    setSelected({ t, w, type });
    setDetails(rows);
  } catch (err) {
    console.error("Failed to load batch details:", err);
  }
}


  function handlePrint() {
    if (!selected) return;

    const docDefinition = {
      content: [
        { text: "Laporan Batch Linen", style: "header" },
        { text: `Tanggal: ${selected.t}`, margin: [0, 10, 0, 0] },
        { text: `Waktu: ${selected.w}` },
        { text: `Jenis: ${selected.type}`, margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*"],
            body: [
              ["UID", "Jenis Linen", "Status", "Antenna"],
              ...details.map((row) => [
                row.uid,
                row.linen,
                row.status,
                row.antenna.toString(),
              ]),
            ],
          },
        },
        {
          text: `\nTotal Linen: ${details.length}`,
          bold: true,
          margin: [0, 10, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: "center",
        },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  return (
    <div className="container py-4">
      <h3>Riwayat Pemrosesan Linen</h3>

      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Waktu</th>
            <th>Jenis</th>
            <th>Total</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch, index) => (
            <tr key={index}>
              <td>{batch.tanggal}</td>
              <td>{batch.waktu}</td>
              <td>{batch.batchType}</td>
              <td>{batch.total}</td>
              <td>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    loadDetails(batch.tanggal, batch.waktu, batch.batchType)
                  }
                >
                  Detail
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selected && (
        <>
          <h5 className="mt-4">
            Detail {selected.t} {selected.w} ({selected.type})
          </h5>
          {details.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>UID</th>
                  <th>Jenis Linen</th>
                  <th>Status</th>
                  <th>Antenna</th>
                </tr>
              </thead>
              <tbody>
                {details.map((row, index) => (
                  <tr key={index}>
                    <td>{row.uid}</td>
                    <td>{row.linen}</td>
                    <td>{row.status}</td>
                    <td>{row.antenna}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">Tidak ada detail untuk batch ini.</p>
          )}

          <Button onClick={handlePrint} variant="success" className="mt-3">
            Cetak PDF
          </Button>
        </>
      )}
    </div>
  );
}
