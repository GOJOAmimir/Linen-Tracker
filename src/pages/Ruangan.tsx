import { useNavigate } from "react-router-dom";

export default function RuanganPage() {
  const navigate = useNavigate();

  const menu = [
    {
      title: "Informasi Batch Usage Aktif",
      desc: "Lihat batch yang sedang aktif di setiap ruangan",
      route: "/ruangan/active-usage",
    },
    {
      title: "Detail Linen per Ruangan",
      desc: "Lihat linen apa saja yang sedang berada di ruangan",
      route: "/ruangan/linen-detail",
    },
    {
      title: "Statistik Ruangan",
      desc: "Grafik dan statistik pemakaian linen",
      route: "/ruangan/statistik",
    },
    {
      title: "Speculated Lost",
      desc: "Daftar batch yang dicurigai hilang",
      route: "/ruangan/lost",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-8">
        Informasi Ruangan
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
        {menu.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.route)}
            aria-label={item.title}
            className="group relative flex flex-col justify-between rounded-2xl p-6 min-h-[170px] text-left
                         bg-white/4 backdrop-blur-md border border-white/6
                         hover:bg-white/6 transition transform hover:-translate-y-2
                         focus:outline-none focus:ring-4 focus:ring-[#24D6AD]/25
                         shadow-lg shadow-[0_8px_30px_rgba(36,214,173,0.06)]
                         hover:shadow-[0_18px_40px_rgba(36,214,173,0.12)]"
          >
            {/* subtle glow layer */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
              }}
            />
            {/* left accent bar when focused/hover (decorative) */}
            <span
              aria-hidden
              className="absolute left-4 top-6 bottom-6 w-1.5 rounded-r-full bg-transparent group-hover:bg-[#24D6AD]/80 transition-all"
              style={{ mixBlendMode: "screen" }}
            />

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#24D6AD]/20 to-[#24D6AD]/10 ring-1 ring-white/6">
                  {/* simple svg icon to match card mood */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#24D6AD] stroke-current"
                    aria-hidden
                  >
                    <rect
                      x="3"
                      y="6"
                      width="6"
                      height="6"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <rect
                      x="15"
                      y="6"
                      width="6"
                      height="6"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <rect
                      x="3"
                      y="14"
                      width="6"
                      height="6"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <rect
                      x="15"
                      y="14"
                      width="6"
                      height="6"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-200/90">{item.desc}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-medium text-[#24D6AD]">Lihat</span>
              <span className="text-xs text-gray-300 group-hover:text-white/90 transition">
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
