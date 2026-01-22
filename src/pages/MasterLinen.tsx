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

// ensure pdfMake vfs available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(pdfMake as any).vfs) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? {};
}

type Linen = {
  LINEN_CREATED_DATE: string;
  LINEN_ID: string;
  LINEN_TYPE: string;
  LINEN_HEIGHT: string;
  LINEN_WIDTH: string;
  LINEN_LENGTH: string;
  LINEN_SIZE_CATEGORY: string;
  LINEN_WEIGHT: string;
  LINEN_MATERIAL: string;
  LINEN_SUPPLIER: string;
  LINEN_TYPE_MOVING: string;
  LINEN_BUDGET_SOURCE: string;
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
      // keep legacy close button click (if present)
      (document.getElementById("closeModalBtn") as HTMLButtonElement)?.click();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // Toggle pilihan untuk delete multiple
  const toggleSelection = (epc: string) => {
    setSelectedEpcs((prev) =>
      prev.includes(epc) ? prev.filter((id) => id !== epc) : [...prev, epc],
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
            header: () => <span className="text-sm">Pilih</span>,
            cell: ({ row }: { row: Row<Linen> }) => (
              <div className="text-center">
                <input
                  type="checkbox"
                  checked={selectedEpcs.includes(row.original.LINEN_ID)}
                  onChange={() => toggleSelection(row.original.LINEN_ID)}
                  className="h-4 w-4 accent-emerald-400"
                />
              </div>
            ),
          },
        ]
      : []),
    { accessorKey: "LINEN_ID", header: "EPC" },
    { accessorKey: "LINEN_TYPE", header: "Linen Type" },
    { accessorKey: "LINEN_HEIGHT", header: "Height" },
    { accessorKey: "LINEN_WIDTH", header: "Width" },
    { accessorKey: "LINEN_MAX_CYCLE", header: "Max Cycle" },
    {
      accessorKey: "LINEN_TOTAL_WASH",
      header: "Siklus",
      cell: ({ row }) => row.original.LINEN_TOTAL_WASH ?? 0,
    },

    { accessorKey: "LINEN_LENGTH", header: "Length" },
    { accessorKey: "LINEN_WEIGHT", header: "Weight" },
    { accessorKey: "LINEN_SIZE_CATEGORY", header: "Size Category" },
    { accessorKey: "LINEN_MATERIAL", header: "Material" },
    { accessorKey: "LINEN_SUPPLIER", header: "Supplier" },
    { accessorKey: "LINEN_BUDGET_SOURCE", header: "Budget Source" },
    { accessorKey: "LINEN_DESCRIPTION", header: "Deskripsi" },
    { accessorKey: "LINEN_CREATED_DATE", header: "Tanggal Input" },
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
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-white mb-3">Master Linen</h2>

      {/* Action & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            className="px-3 py-2 rounded-md bg-emerald-400 text-black font-medium hover:bg-emerald-300 transition"
            // legacy attributes left as-is (Bootstrap not used) — you can wire modal open logic later
            data-bs-toggle="modal"
            data-bs-target="#addLinenModal"
            type="button"
          >
            + Tambah
          </button>

          <button
            className={`px-3 py-2 rounded-md transition ${
              editMode
                ? "bg-yellow-400 text-black hover:bg-yellow-300"
                : "border border-white/10 text-gray-200 hover:bg-white/5"
            }`}
            onClick={() => {
              setEditMode(!editMode);
              setSelectedEpcs([]);
            }}
            type="button"
          >
            {editMode ? "Selesai" : "Edit"}
          </button>

          {editMode && selectedEpcs.length > 0 && (
            <button
              className="px-3 py-2 rounded-md bg-rose-500 text-white hover:bg-rose-400 transition"
              onClick={handleDelete}
              type="button"
            >
              Hapus ({selectedEpcs.length})
            </button>
          )}
        </div>

        {/* Search & Sort container */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <input
            type="text"
            className="px-3 py-2 rounded-md bg-white/5 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Cari linen..."
            style={{ maxWidth: 300 }}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            aria-label="Cari linen"
          />

          <div className="flex items-center gap-2">
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
              className="px-3 py-2 rounded-md bg-white/5 text-gray-100 focus:outline-none"
              aria-label="Urutkan"
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
              className="px-3 py-2 rounded-md border border-white/10 text-gray-100 hover:bg-white/5 transition"
              onClick={handlePrintMasterLinen}
              title="Cetak / Export ke PDF"
              type="button"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Modal (UI-only Tailwind markup) */}
      <div
        id="addLinenModal"
        className="fixed inset-0 z-40 hidden items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="addLinenModalLabel"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative max-w-lg w-full bg-[#1f1f1f] border border-white/6 rounded-lg shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h5
                id="addLinenModalLabel"
                className="text-lg font-semibold text-white"
              >
                Tambah Linen Baru
              </h5>
              <button
                id="closeModalBtn"
                type="button"
                className="text-gray-300 hover:text-white rounded-md p-1"
                // keep as no-op — bootstrap not used; external code may call this element by id
                onClick={(e) => {
                  // hide modal if it was opened by adding a 'hidden' toggle (used when integrating)
                  const root = document.getElementById("addLinenModal");
                  if (root) root.classList.add("hidden");
                }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-200 mb-1">EPC</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-md bg-white/5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={epc}
                  onChange={(e) => setEpc(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Tipe Linen
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-md bg-white/5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Max Cycle
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-md bg-white/5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={maxCycle}
                  onChange={(e) => setMaxCycle(parseInt(e.target.value))}
                  required
                  min={1}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded-md border border-white/10 text-gray-200 hover:bg-white/5 transition"
                onClick={() => {
                  const root = document.getElementById("addLinenModal");
                  if (root) root.classList.add("hidden");
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded-md bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table container — glass / blur style for dark theme */}
      <div className="rounded-xl bg-white/5 backdrop-blur-md border border-emerald-400/10 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-black/30 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-left">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-3 py-3 text-xs font-semibold text-gray-300 select-none"
                    style={{
                      cursor: header.column.getCanSort()
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </span>
                      <span className="text-xs">
                        {header.column.getIsSorted() === "asc"
                          ? "▲"
                          : header.column.getIsSorted() === "desc"
                            ? "▼"
                            : ""}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/6 even:bg-white/2 hover:bg-white/5 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 align-top text-gray-100"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-6 text-center text-gray-400"
                >
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
