import React from "react";
import {
  BsDropletHalf,
  BsBoxArrowRight,
  BsExclamationTriangleFill,
} from "react-icons/bs";
import { LuLayers } from "react-icons/lu";

export type StatusCounts = {
  intransit: number;
  dicuci: number;
  bersih: number;
  keluar?: number;
  hilang: number;
};

type Props = {
  counts: StatusCounts;
  onCardClick?: (key: keyof StatusCounts) => void;
};

export default function StatusSummary({ counts, onCardClick }: Props) {
  const nf = new Intl.NumberFormat();

  const cardData: {
    key: keyof StatusCounts;
    label: string;
    bgClass: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "intransit",
      label: "Intransit",
      bgClass: "bg-success",
      icon: <BsBoxArrowRight size={46} />,
    },
    {
      key: "dicuci",
      label: "Dicuci",
      bgClass: "bg-warning text-dark",
      icon: <BsDropletHalf size={46} />,
    },
    {
      key: "bersih",
      label: "Bersih",
      bgClass: "bg-info text-dark",
      icon: <LuLayers size={46} />,
    },
    {
      key: "hilang",
      label: "Hilang",
      bgClass: "bg-danger",
      icon: <BsExclamationTriangleFill size={46} />,
    },
  ];

  const handleKey = (e: React.KeyboardEvent, k: keyof StatusCounts) => {
    if (onCardClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onCardClick(k);
    }
  };

  return (
    <div className="d-flex w-100 gap-3 flex-wrap">
      {cardData.map((c) => {
        const value = counts?.[c.key] ?? 0;
        return (
          <div
            key={c.key}
            style={{ flex: 1, minWidth: 170, maxWidth: 360 }}
            role={onCardClick ? "button" : undefined}
            tabIndex={onCardClick ? 0 : undefined}
            aria-label={`${c.label}: ${value}`}
            onClick={() => onCardClick?.(c.key)}
            onKeyDown={(e) => onCardClick && handleKey(e, c.key)}
          >
            <div
              className={`card text-white ${c.bgClass}`}
              style={{
                borderRadius: 26,
                padding: "20px 16px",
                height: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 150ms ease, box-shadow 150ms ease",
                boxShadow: "0 6px 14px rgba(10,10,10,0.06)",
                cursor: onCardClick ? "pointer" : "default",
              }}
              onMouseOver={(e) => {
                if (onCardClick) {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-6px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 12px 30px rgba(10,10,10,0.12)";
                }
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 6px 14px rgba(10,10,10,0.06)";
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div
                    style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1 }}
                  >
                    {nf.format(value)}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginTop: 6,
                      opacity: 0.95,
                    }}
                  >
                    {c.label}
                  </div>
                </div>

                <div style={{ opacity: 0.95 }}>{c.icon}</div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 6,
                }}
              >
                {onCardClick ? (
                  <small style={{ fontSize: 11, opacity: 0.95 }}>
                    Klik untuk filter
                  </small>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
