import {
  BsTrashFill,
  BsDropletHalf,
  BsBoxArrowRight,
  BsExclamationTriangleFill,
} from "react-icons/bs";
import { LuLayers } from "react-icons/lu";


export type StatusCounts = {
  kotor: number;
  dicuci: number;
  bersih: number;
  keluar: number;
  hilang: number;
};

type Props = {
  counts: StatusCounts;
};

export default function StatusSummary({ counts }: Props) {
  const cardData = [
    {
      label: "Kotor",
      count: counts.kotor,
      icon: <BsTrashFill size={70} />,
      color: "danger",
    },
    {
      label: "Dicuci",
      count: counts.dicuci,
      icon: <BsDropletHalf size={70} />,
      color: "warning",
    },
    {
      label: "Bersih",
      count: counts.bersih,
      icon: <LuLayers size={70} />,
      color: "info",
    },
    {
      label: "Keluar",
      count: counts.keluar,
      icon: <BsBoxArrowRight size={70} />,
      color: "success",
    },
    {
      label: "Hilang",
      count: counts.hilang,
      icon: <BsExclamationTriangleFill size={70} />,
      color: "secondary",
    },
  ];

  return (
  <div className="d-flex w-100 gap-3 flex-wrap">
    {cardData.map((item) => (
      <div key={item.label} style={{ flex: 1, minWidth: "150px" }}>
        <div
          className={`card border-0 text-white bg-${item.color}`}
          style={{
            borderRadius: "1rem",
            height: "120px",
            padding: "1rem 1.2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            justifyContent: "space-between",
          }}
        >
          <div className="d-flex justify-content-between w-100 align-items-center">
            <span
              style={{
                fontSize: "3.5rem",
                fontWeight: 900,
                fontFamily: "'Segoe UI', monospace",
              }}
            >
              {item.count}
            </span>
            {item.icon}
          </div>
          <p
            className="text-white mb-0"
            style={{
              fontWeight: 500,
              fontSize: "0.7rem",
              letterSpacing: "2px",
            }}
          >
            {item.label}
          </p>
        </div>
      </div>
    ))}
  </div>
);

}
