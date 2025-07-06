import StatusSummary from "../components/StatusSummary";
import { BsHouseDoorFill } from "react-icons/bs";

type Props = {
  statusCounts: {
    kotor: number;
    dicuci: number;
    hilang: number;
    keluar: number;
  };
};

export default function Dashboard({ statusCounts }: Props) {
  return (
    <div>
      <div className="d-flex align-items-end mb-4">
        <h2 className="mb-0">
          <BsHouseDoorFill size={25} className="me-2" />
          Dashboard
        </h2>
        <hr className="text-white my-1" />
      </div>

      <StatusSummary counts={statusCounts} />

      <div className="mt-5">
        <h4>Selamat datang!</h4>
        <p>
          Gunakan menu di samping untuk mengakses laporan per batch dan riwayat
          linen.
        </p>
      </div>
    </div>
  );
}
