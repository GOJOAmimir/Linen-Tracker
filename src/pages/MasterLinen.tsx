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

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/master-line`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3 text-start">Master Linen</h2>
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
          {data.map((linen) => (
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
