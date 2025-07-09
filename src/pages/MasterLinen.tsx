import { useEffect, useState } from "react";

type Linen = {
  EPC: string;
  Tipe: string;
  MaxCuci: number;
  cycle: number;
  Status: string;
};

export default function MasterLinen() {
  const [data, setData] = useState<Linen[]>([]);
  const [filteredData, setFilteredData] = useState<Linen[]>([]);
  const [search, setSearch] = useState("");

  const [epc, setEpc] = useState("");
  const [tipe, setTipe] = useState("");
  const [maxCycle, setMaxCycle] = useState(20);

  const [editMode, setEditMode] = useState(false);
  const [selectedEpcs, setSelectedEpcs] = useState<string[]>([]);

  const fetchData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/master-linen`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setFilteredData(result);
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(fetchData, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = data.filter(
      (item) =>
        item.EPC.toLowerCase().includes(lower) ||
        item.Tipe.toLowerCase().includes(lower)
    );
    setFilteredData(filtered);
  }, [search, data]);

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

  const toggleSelection = (epc: string) => {
    setSelectedEpcs((prev) =>
      prev.includes(epc) ? prev.filter((id) => id !== epc) : [...prev, epc]
    );
  };

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

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3 text-start">Master Linen</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
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

        <input
          type="text"
          placeholder="Cari EPC atau Tipe..."
          className="form-control w-25"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

      {/* Tabel Linen */}
      <table className="table table-bordered table-striped table-sm">
        <thead>
          <tr>
            {editMode && <th className="text-center">Pilih</th>}
            <th>EPC</th>
            <th>Tipe Linen</th>
            <th className="text-center">Maximal Siklus</th>
            <th className="text-center">Siklus</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((linen) => (
            <tr key={linen.EPC}>
              {editMode && (
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={selectedEpcs.includes(linen.EPC)}
                    onChange={() => toggleSelection(linen.EPC)}
                  />
                </td>
              )}
              <td>{linen.EPC}</td>
              <td>{linen.Tipe}</td>
              <td className="text-center">{linen.MaxCuci}</td>
              <td className="text-center">{linen.cycle}</td>
              <td className="text-center">{linen.Status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
