import { useEffect, useState } from "react";
import type { ColumnDef, SortingState, Row } from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

if (!(pdfMake as any).vfs) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? {};
}

type Linen = {
  LINEN_CREATED_DATE: string;
  LINEN_ID: string;
  LINEN_TYPE: string;
  LINEN_HEIGHT: string;
  LINEN_WIDTH: string;
  LINEN_MAX_CYCLE: number;
  LINEN_TOTAL_WASH: number;
  LINEN_DESCRIPTION: string;
  LINEN_STATUS: string;
};

export default function MasterLinen() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [data, setData] = useState<Linen[]>([]);

  const [epc, setEpc] = useState("");
  const [tipe, setTipe] = useState("");
  const [maxCycle, setMaxCycle] = useState(20);

  const [editMode, setEditMode] = useState(false);
  const [selectedEpcs, setSelectedEpcs] = useState<string[]>([]);

  const fetchData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/master-linen`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setData(result.data);
        } else {
          console.error("Format data tidak sesuai:", result);
          setData([]);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(fetchData, []);

  // Tambah Linen
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/master-linen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epc, tipe, maxCycle }),
      });

      const result = await res.json();
      alert(result.message || "Linen ditambahkan");
      setEpc("");
      setTipe("");
      setMaxCycle(20);
      fetchData();
      (document.getElementById("closeModalBtn") as HTMLButtonElement)?.click();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // Toggle pilihan untuk delete multiple
  const toggleSelection = (epc: string) => {
    setSelectedEpcs((prev) =>
      prev.includes(epc) ? prev.filter((id) => id !== epc) : [...prev, epc]
    );
  };

  // Hapus linen yang dipilih
  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${selectedEpcs.length} linen?`))
      return;

    try {
      for (const epc of selectedEpcs) {
        await fetch(`${import.meta.env.VITE_API_URL}/master-linen/${epc}`, {
          method: "DELETE",
        });
      }
      alert("Linen berhasil dihapus.");
      setSelectedEpcs([]);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Print / PDF function — gunakan data state saat ini
  const handlePrintMasterLinen = () => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk dicetak.");
      return;
    }

    const body = [
      [
        { text: "No", style: "tableHeader" },
        { text: "EPC", style: "tableHeader" },
        { text: "Tipe Linen", style: "tableHeader" },
        { text: "Max Cycle", style: "tableHeader" },
        { text: "Total Wash", style: "tableHeader" },
        { text: "Tanggal Buat", style: "tableHeader" },
      ],
      ...data.map((d, idx) => [
        idx + 1,
        d.LINEN_ID ?? "",
        d.LINEN_TYPE ?? "",
        d.LINEN_MAX_CYCLE != null ? String(d.LINEN_MAX_CYCLE) : "",
        d.LINEN_TOTAL_WASH != null ? String(d.LINEN_TOTAL_WASH) : "0",
        d.LINEN_CREATED_DATE ?? "",
      ]),
    ];

    const docDefinition = {
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [28, 40, 28, 40],
      content: [
        { text: "RS Cileungsi", style: "mainTitle" },
        { text: "Data Linen", style: "subTitle", margin: [0, 2, 0, 8] },
        {
          table: {
            headerRows: 1,
            widths: [30, "*", 120, 70, 70, 100],
            body,
          },
          layout: "lightHorizontalLines",
        },
        {
          text: `\nTotal Linen : ${data.length}`,
          alignment: "right",
          bold: true,
          margin: [0, 8, 0, 0],
        },
      ],
      styles: {
        mainTitle: {
          fontSize: 16,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 4],
        },
        subTitle: { fontSize: 13, bold: true, alignment: "center" },
        tableHeader: { bold: true, fillColor: "#f3f4f6", fontSize: 10 },
      },
      defaultStyle: { fontSize: 9 },
    };

    pdfMake.createPdf(docDefinition).open();
  };

  // Definisi kolom tabel
  const columns: ColumnDef<Linen>[] = [
    ...(editMode
      ? [
          {
            id: "select",
            header: () => <span>Pilih</span>,
            cell: ({ row }: { row: Row<Linen> }) => (
              <div className="text-center">
                <input
                  type="checkbox"
                  checked={selectedEpcs.includes(row.original.LINEN_ID)}
                  onChange={() => toggleSelection(row.original.LINEN_ID)}
                />
              </div>
            ),
          },
        ]
      : []),
    { accessorKey: "LINEN_ID", header: "EPC" },
    { accessorKey: "LINEN_TYPE", header: "Tipe Linen" },
    { accessorKey: "LINEN_HEIGHT", header: "Height" },
    { accessorKey: "LINEN_WIDTH", header: "Width" },
    { accessorKey: "LINEN_MAX_CYCLE", header: "Max Cycle" },
    {
      accessorKey: "LINEN_TOTAL_WASH",
      header: "Siklus",
      cell: ({ row }) => row.original.LINEN_TOTAL_WASH ?? 0,
    },

    { accessorKey: "LINEN_DESCRIPTION", header: "Deskripsi" },
    { accessorKey: "LINEN_CREATED_DATE", header: "Tanggal Input" },
    { accessorKey: "LINEN_STATUS", header: "Status" },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3 text-start">Master Linen</h2>

      {/* Action & Search Row */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        {/* Action buttons */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            data-bs-toggle="modal"
            data-bs-target="#addLinenModal"
          >
            + Tambah
          </button>

          <button
            className={`btn ${
              editMode ? "btn-warning" : "btn-outline-secondary"
            }`}
            onClick={() => {
              setEditMode(!editMode);
              setSelectedEpcs([]);
            }}
          >
            {editMode ? "Selesai" : "Edit"}
          </button>

          {editMode && selectedEpcs.length > 0 && (
            <button className="btn btn-danger" onClick={handleDelete}>
              Hapus ({selectedEpcs.length})
            </button>
          )}
        </div>

        {/* Search & Sort container (Search on top, Sort + Print below aligned right) */}
        <div className="d-flex flex-column align-items-end gap-2">
          {/* Search */}
          <input
            type="text"
            className="form-control"
            placeholder="Cari linen..."
            style={{ maxWidth: 300 }}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />

          {/* Sort + Print row */}
          <div className="d-flex gap-2">
            <select
              value={
                sorting[0]
                  ? (sorting[0].id as string) +
                    (sorting[0].desc ? "_desc" : "_asc")
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return setSorting([]);
                const lastUnderscore = value.lastIndexOf("_");
                const id =
                  lastUnderscore > 0
                    ? value.substring(0, lastUnderscore)
                    : value;
                const dir =
                  lastUnderscore > 0
                    ? value.substring(lastUnderscore + 1)
                    : "asc";
                setSorting([{ id, desc: dir === "desc" }]);
              }}
              className="form-select"
              style={{
                minWidth: 200,
                borderRadius: 8,
                backgroundColor: "#fbfbfb",
                color: "#222",
                border: "1px solid #ddd",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                cursor: "pointer",
              }}
            >
              <option value="">Urutkan...</option>
              <option value="LINEN_TOTAL_WASH_desc">Siklus tertinggi</option>
              <option value="LINEN_TOTAL_WASH_asc">Siklus terendah</option>
              <option value="LINEN_TYPE_asc">Tipe Linen (A-Z)</option>
              <option value="LINEN_TYPE_desc">Tipe Linen (Z-A)</option>
              <option value="LINEN_CREATED_DATE_desc">Terbaru</option>
              <option value="LINEN_CREATED_DATE_asc">Terlama</option>
            </select>

            <button
              className="btn btn-outline-primary"
              onClick={handlePrintMasterLinen}
              title="Cetak / Export ke PDF"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah Linen */}
      <div
        className="modal fade"
        id="addLinenModal"
        tabIndex={-1}
        aria-labelledby="addLinenModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title" id="addLinenModalLabel">
                  Tambah Linen Baru
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  id="closeModalBtn"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">EPC</label>
                  <input
                    type="text"
                    className="form-control"
                    value={epc}
                    onChange={(e) => setEpc(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipe Linen</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Max Cycle</label>
                  <input
                    type="number"
                    className="form-control"
                    value={maxCycle}
                    onChange={(e) => setMaxCycle(parseInt(e.target.value))}
                    required
                    min={1}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <table className="table table-bordered table-striped table-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: "pointer" }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() === "asc" && " 🔼"}
                  {header.column.getIsSorted() === "desc" && " 🔽"}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
