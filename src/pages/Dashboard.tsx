import StatusSummary from "../components/StatusSummary";
import BatchSummary from "../components/BatchSummary";
import LinenByDay from "../components/LinenByDay";
import TopCycles from "../components/TopCycle";
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
      </div>

      <StatusSummary counts={statusCounts} />

      <div className="row mt-4 g-3 align-items-stretch">
        <div className="col-md-6">
          <BatchSummary />
        </div>
        <div className="col-md-6">
          <LinenByDay />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-12">
          <TopCycles />
        </div>
      </div>
    </div>
  );
}
