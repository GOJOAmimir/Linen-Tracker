import React from "react";
import {
  BsDropletHalf,
  BsBoxArrowRight,
  BsExclamationTriangleFill,
  BsArrowDownRightCircleFill,
} from "react-icons/bs";
import { LuLayers } from "react-icons/lu";

export type StatusCounts = {
  intransit: number;
  dicuci: number;
  bersih: number;
  hilang: number;
  dipakai?: number;
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
    borderColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "dipakai",
      label: "Dipakai",
      borderColor: "border-[#24D6AD]",
      icon: <BsArrowDownRightCircleFill size={46} />,
    },
    {
      key: "dicuci",
      label: "Diproses",
      borderColor: "border-[#FDB813]",
      icon: <BsDropletHalf size={46} />,
    },
    {
      key: "bersih",
      label: "Bersih",
      borderColor: "border-[#3EA8FF]",
      icon: <LuLayers size={46} />,
    },
    {
      key: "intransit",
      label: "Intransit",
      borderColor: "border-[#24D6AD]",
      icon: <BsBoxArrowRight size={46} />,
    },
    {
      key: "hilang",
      label: "Hilang",
      borderColor: "border-[#DC3545]",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
      {cardData.map((c) => {
        const value = counts?.[c.key] ?? 0;

        return (
          <div
            key={c.key}
            role={onCardClick ? "button" : "status"}
            tabIndex={onCardClick ? 0 : undefined}
            aria-label={`${c.label}: ${value}`}
            onClick={() => onCardClick?.(c.key)}
            onKeyDown={(e) => onCardClick && handleKey(e, c.key)}
            className={`
              border-2 ${c.borderColor}
              rounded-[26px]
              p-6
              min-h-[60px]
              flex flex-col justify-center
              shadow-sm
              transition-all duration-150 ease-out

              bg-white
              text-gray-800
              hover:shadow-md

              dark:bg-[#1a1818]
              dark:text-white
              dark:shadow-md

              ${
                onCardClick
                  ? "cursor-pointer hover:-translate-y-1.5"
                  : "cursor-default"
              }
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-5xl font-extrabold leading-none">
                  {nf.format(value)}
                </div>

                <div
                  className="
                  text-sm font-semibold mt-1.5
                  text-gray-600
                  dark:text-gray-300
                "
                >
                  {c.label}
                </div>
              </div>

              <div
                className="
                opacity-80
                text-gray-400
                dark:text-gray-400
              "
              >
                {c.icon}
              </div>
            </div>

            {onCardClick && (
              <div className="flex justify-end mt-1.5">
                <small
                  className="
                  text-[11px]
                  text-gray-500
                  dark:text-gray-400
                "
                >
                  Klik untuk filter
                </small>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
