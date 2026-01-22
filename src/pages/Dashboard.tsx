import StatusSummary from "../components/StatusSummary";
import BatchSummary from "../components/BatchSummary";
import LinenByDay from "../components/LinenByDay";
import TopCycles from "../components/TopCycle";

type Props = {
  statusCounts: {
    intransit: number;
    dicuci: number;
    bersih: number;
    hilang: number;
    dipakai?: number;
  };
};

export default function Dashboard({ statusCounts }: Props) {
  return (
    <div className="space-y-6">
      {/* Status cards */}
      <StatusSummary counts={statusCounts} />

      {/* Middle grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full flex flex-col rounded-xl">
          <BatchSummary />
        </div>

        <div className="h-full flex flex-col rounded-xl">
          <LinenByDay />
        </div>
      </div>

      {/* Bottom section */}
      <div className="w-full">
        <TopCycles />
      </div>
    </div>
  );
}
