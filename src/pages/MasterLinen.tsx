import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
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
          setData([
            {
              LINEN_CREATED_DATE: "2024-01-01",
              LINEN_ID: "E245245AD21341255",
              LINEN_TYPE: "Dummy Linen",
              LINEN_HEIGHT: "100",
              LINEN_WIDTH: "80",
              LINEN_LENGTH: "200",
              LINEN_SIZE_CATEGORY: "MEDIUM",
              LINEN_WEIGHT: "1.5",
              LINEN_MATERIAL: "Cotton",
              LINEN_SUPPLIER: "Dummy Supplier",
              LINEN_TYPE_MOVING: "Storage",
              LINEN_BUDGET_SOURCE: "Internal",
              LINEN_MAX_CYCLE: 200,
              LINEN_TOTAL_WASH: 102,
              LINEN_DESCRIPTION: "Dummy data for testing",
              LINEN_STATUS: "ACTIVE",
            },
            {
              LINEN_CREATED_DATE: "2024-01-01",
              LINEN_ID: "E2806A9600004016A4D71C356",
              LINEN_TYPE: "Dummy Linen",
              LINEN_HEIGHT: "120",
              LINEN_WIDTH: "100",
              LINEN_LENGTH: "200",
              LINEN_SIZE_CATEGORY: "LARGE",
              LINEN_WEIGHT: "1.5",
              LINEN_MATERIAL: "Cotton",
              LINEN_SUPPLIER: "Dummy Supplier",
              LINEN_TYPE_MOVING: "Storage",
              LINEN_BUDGET_SOURCE: "Internal",
              LINEN_MAX_CYCLE: 160,
              LINEN_TOTAL_WASH: 159,
              LINEN_DESCRIPTION: "Dummy data for testing",
              LINEN_STATUS: "ACTIVE",
            },
            {
              LINEN_CREATED_DATE: "2024-01-01",
              LINEN_ID: "E2806A9600004016A4D72541",
              LINEN_TYPE: "Dummy Linen",
              LINEN_HEIGHT: "50",
              LINEN_WIDTH: "80",
              LINEN_LENGTH: "120",
              LINEN_SIZE_CATEGORY: "LARGE",
              LINEN_WEIGHT: "2.5",
              LINEN_MATERIAL: "Cotton",
              LINEN_SUPPLIER: "Dummy Supplier",
              LINEN_TYPE_MOVING: "Storage",
              LINEN_BUDGET_SOURCE: "Internal",
              LINEN_MAX_CYCLE: 150,
              LINEN_TOTAL_WASH: 89,
              LINEN_DESCRIPTION: "Dummy data for testing",
              LINEN_STATUS: "ACTIVE",
            },
            ...result.data,
          ]);
        } else {
          console.error("Format data tidak sesuai:", result);
          setData([]);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(fetchData, []);

  // Handle URL search parameter
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setGlobalFilter(searchParam);
      // Optionally clear the URL parameter after applying it
      // setSearchParams({});
    }
  }, [searchParams]);

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
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Master Linen
      </h2>

      {/* Show notification if coming from a notification click */}
      {searchParams.get("search") && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">🔍</span>
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Menampilkan hasil untuk:{" "}
              <strong>{searchParams.get("search")}</strong>
            </p>
          </div>
          <button
            onClick={() => {
              setGlobalFilter("");
              setSearchParams({});
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Hapus filter
          </button>
        </div>
      )}

      {/* Action & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            className="px-3 py-2 rounded-md bg-emerald-500 dark:bg-emerald-400 text-white dark:text-black font-medium hover:bg-emerald-600 dark:hover:bg-emerald-300 transition"
            data-bs-toggle="modal"
            data-bs-target="#addLinenModal"
            type="button"
          >
            + Tambah
          </button>

          <button
            className={`px-3 py-2 rounded-md transition ${
              editMode
                ? "bg-yellow-500 dark:bg-yellow-400 text-white dark:text-black hover:bg-yellow-600 dark:hover:bg-yellow-300"
                : "border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
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
              className="px-3 py-2 rounded-md bg-rose-500 text-white hover:bg-rose-600 dark:hover:bg-rose-400 transition"
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
            className="px-3 py-2 rounded-md bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 border border-gray-300 dark:border-transparent"
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
              className="
                          px-3 py-2 rounded-md
                          bg-gray-100 text-gray-900 border border-gray-300
                          focus:outline-none
                          dark:bg-neutral-900 dark:text-gray-100 dark:border-white/10
                        "
              aria-label="Urutkan"
            >
              <option
                value=""
                className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
              >
                Urutkan...
              </option>

              <option
                value="LINEN_TOTAL_WASH_desc"
                className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
              >
                Siklus tertinggi
              </option>

              <option
                value="LINEN_TOTAL_WASH_asc"
                className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
              >
                Siklus terendah
              </option>

              <option
                value="LINEN_TYPE_asc"
                className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
              >
                Tipe Linen (A-Z)
              </option>

              <option
                value="LINEN_TYPE_desc"
                className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
              >
                Tipe Linen (Z-A)
              </option>

              <option
                value="LINEN_CREATED_DATE_desc"
                className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
              >
                Terbaru
              </option>

              <option
                value="LINEN_CREATED_DATE_asc"
                className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
              >
                Terlama
              </option>
            </select>

            <button
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 transition"
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
        <div className="relative max-w-lg w-full bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-white/6 rounded-lg shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h5
                id="addLinenModalLabel"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Tambah Linen Baru
              </h5>
              <button
                id="closeModalBtn"
                type="button"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md p-1"
                onClick={() => {
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
                <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                  EPC
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 border border-gray-300 dark:border-transparent"
                  value={epc}
                  onChange={(e) => setEpc(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                  Tipe Linen
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 border border-gray-300 dark:border-transparent"
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                  Max Cycle
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 border border-gray-300 dark:border-transparent"
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
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                onClick={() => {
                  const root = document.getElementById("addLinenModal");
                  if (root) root.classList.add("hidden");
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded-md bg-emerald-500 dark:bg-emerald-400 text-white dark:text-black font-semibold hover:bg-emerald-600 dark:hover:bg-emerald-300 transition"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table container */}
      <div className="rounded-xl bg-gray-50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-emerald-400/10 overflow-auto shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-100 dark:bg-black/30 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-left">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 select-none"
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
              table.getRowModel().rows.map((row) => {
                const CycleValue = row.original.LINEN_TOTAL_WASH ?? 0;

                const highlightClass =
                  CycleValue > 150
                    ? "bg-rose-100 dark:bg-rose-500/30 hover:bg-rose-200 dark:hover:bg-rose-500/40"
                    : CycleValue > 80
                      ? "bg-yellow-100 dark:bg-yellow-400/30 hover:bg-yellow-200 dark:hover:bg-yellow-400/40"
                      : "even:bg-gray-50 dark:even:bg-white/2 hover:bg-gray-100 dark:hover:bg-white/5";

                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-200 dark:border-white/6 transition-colors ${highlightClass}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-2 align-top text-gray-900 dark:text-gray-100"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-6 text-center text-gray-500 dark:text-gray-400"
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
