import {
  BsTrashFill,
  BsDropletHalf,
  BsBoxArrowRight,
  BsExclamationTriangleFill,
} from "react-icons/bs";

export type StatusCounts = {
  kotor: number;
  dicuci: number;
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
      icon: <BsTrashFill size={110} />,
      color: "danger",
    },
    {
      label: "Dicuci",
      count: counts.dicuci,
      icon: <BsDropletHalf size={110} />,
      color: "warning",
    },
    {
      label: "Keluar",
      count: counts.keluar,
      icon: <BsBoxArrowRight size={110} />,
      color: "success",
    },
    {
      label: "Hilang",
      count: counts.hilang,
      icon: <BsExclamationTriangleFill size={110} />,
      color: "secondary",
    },
  ];

  return (
    <div className="row">
      {cardData.map((item) => (
        <div className="col-6 col-md-3 mb-4" key={item.label}>
          <div
            className={`card border-0 text-white bg-${item.color}`}
            style={{
              borderRadius: "1rem",
              height: "160px",
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
                  fontSize: "4.5rem",
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
                marginTop: "Left",
                fontSize: "1.3rem",
                letterSpacing: "0.3px",
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
