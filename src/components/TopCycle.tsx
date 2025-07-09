import { useEffect, useState } from "react";

type Linen = {
  EPC: string;
  Tipe: string;
  cycle: number;
  MaxCuci: number;
};

export default function TopCycles() {
  const [data, setData] = useState<Linen[]>([]);

  useEffect(() => {
    // Ganti dengan fetch asli nanti
    const dummy: Linen[] = [
      { EPC: "E200341201", Tipe: "Seprei", cycle: 18, MaxCuci: 20 },
      { EPC: "E200341202", Tipe: "Handuk", cycle: 17, MaxCuci: 20 },
      { EPC: "E200341203", Tipe: "Sarung Bantal", cycle: 16, MaxCuci: 20 },
      { EPC: "E200341204", Tipe: "Selimut", cycle: 15, MaxCuci: 20 },
      { EPC: "E200341205", Tipe: "Bed Cover", cycle: 14, MaxCuci: 20 },
    ];
    setData(dummy);
  }, []);

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">Siklus Linen Tertinggi</h5>
      </div>
      <div className="card-body">
        <table className="table table-sm table-bordered mb-0">
          <thead className="table-light">
            <tr>
              <th>EPC</th>
              <th>Tipe</th>
              <th className="text-center">Siklus</th>
              <th className="text-center">Max</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.EPC}>
                <td>{item.EPC}</td>
                <td>{item.Tipe}</td>
                <td className="text-center">{item.cycle}</td>
                <td className="text-center">{item.MaxCuci}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
