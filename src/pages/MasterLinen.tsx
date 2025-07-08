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
  const [searchTerm, setSearchTerm] = useState("");
  const [epcInput, setEpcInput] = useState("");
  const [tipeInput, setTipeInput] = useState("");

  // Fetch data awal
  const fetchData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/master-linen`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(fetchData, []);

  // Filter data berdasar input pencarian
  const filteredData = data.filter(
    (linen) =>
      linen.EPC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      linen.Tipe.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Submit data baru
  const handleAddLinen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epcInput.trim() || !tipeInput.trim()) {
      alert("EPC dan Tipe tidak boleh kosong.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/master-linen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epc: epcInput, tipe: tipeInput }),
      });

      const result = await res.json();
      alert(result.message || "Linen berhasil ditambahkan");
      setEpcInput("");
      setTipeInput("");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Tambah linen error:", err);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3 text-start">Master Linen</h2>

      {/* Form tambah data */}
      <form onSubmit={handleAddLinen} className="mb-4 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="EPC"
          value={epcInput}
          onChange={(e) => setEpcInput(e.target.value)}
        />
        <input
          type="text"
          className="form-control"
          placeholder="Tipe Linen"
          value={tipeInput}
          onChange={(e) => setTipeInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Tambah
        </button>
      </form>

      {/* Input pencarian */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Cari EPC atau Tipe Linen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="table table-bordered table-striped table-sm">
        <thead>
          <tr>
            <th>EPC</th>
            <th>Tipe Linen</th>
            <th className="text-center w-auto">Maximal Siklus</th>
            <th className="text-center w-auto">Siklus</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((linen) => (
            <tr key={linen.EPC}>
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
