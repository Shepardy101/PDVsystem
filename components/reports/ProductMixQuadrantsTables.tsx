import React, { useMemo } from "react";

interface ProductPoint {
  x: number; // Frequência
  y: number; // Volume
  label: string;
  color?: string;
}

interface Props {
  points: ProductPoint[];
  midX: number;
  midY: number;
}

const QUADRANTS = [
  { key: "q1", label: "Reposição prioritária", color: "#66f3ff" },
  { key: "q2", label: "Venda pontual / oportunidade", color: "#b388ff" },
  { key: "q3", label: "Parados / abaixo da média", color: "#b388ff" },
  { key: "q4", label: "Fluxo recorrente", color: "#66f3ff" },
];

function getQuadrant(p: ProductPoint, midX: number, midY: number) {
  if (p.x >= midX && p.y >= midY) return "q1"; // superior direito
  if (p.x < midX && p.y >= midY) return "q2"; // superior esquerdo
  if (p.x < midX && p.y < midY) return "q3"; // inferior esquerdo
  if (p.x >= midX && p.y < midY) return "q4"; // inferior direito
  return "q3";
}

const ProductMixQuadrantsTables: React.FC<Props> = ({ points, midX, midY }) => {
  const [activeTab, setActiveTab] = React.useState("q1");

  const productsByQuadrant = useMemo(() => {
    const map: Record<string, ProductPoint[]> = { q1: [], q2: [], q3: [], q4: [] };
    points.forEach((p) => {
      const q = getQuadrant(p, midX, midY);
      map[q].push(p);
    });
    return map;
  }, [points, midX, midY]);

  return (
    <div className="w-full  bg-dark-900/40 border border-white/10 rounded-xl p-4 flex flex-col">
    <div className="flex gap-0 mb-4 border-b border-white/10">
      {QUADRANTS.map((q, idx) => (
        <button
        key={q.key}
        className={`
          px-4 py-2 font-bold text-xs transition-all
          border-b-2
          ${activeTab === q.key ? "border-cyan-400 text-cyan-200 bg-dark-800" : "border-transparent text-slate-400 bg-dark-900/60"}
          ${idx !== 0 ? "border-l border-white/10" : ""}
          hover:bg-cyan-900/30 hover:text-cyan-200 hover:scale-105
          focus:outline-none
          rounded-t-lg
        `}
        style={{
          color: activeTab === q.key ? q.color : undefined,
          zIndex: activeTab === q.key ? 1 : 0,
          position: "relative",
          transition: "background 0.2s, color 0.2s, transform 0.15s"
        }}
        onClick={() => setActiveTab(q.key)}
        >
        {q.label}
        </button>
      ))}
    </div>
      <div className="overflow-x-auto" style={{ maxHeight: '50vh' }}>
        <div style={{ maxHeight: '31vh', overflowY: 'auto' }}>
          <table className="min-w-full text-xs text-left text-white">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-1 px-2">Produto</th>
                <th className="py-1 px-2">Frequência</th>
                <th className="py-1 px-2">Volume</th>
              </tr>
            </thead>
            <tbody>
              {productsByQuadrant[activeTab].length === 0 ? (
                <tr><td colSpan={3} className="text-slate-400 py-2">Nenhum produto neste quadrante.</td></tr>
              ) : (
                (() => {
                  const maxFreq = Math.max(...productsByQuadrant[activeTab].map(p => p.x));
                  const maxVol = Math.max(...productsByQuadrant[activeTab].map(p => p.y));
                  return productsByQuadrant[activeTab].map((p, i) => (
                    <tr key={p.label + i} className="border-b border-white/5">
                      <td className="py-1 px-2">{p.label}</td>
                      <td className="py-1 px-2 min-w-[90px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono w-8 text-right">{p.x}</span>
                          <div className="flex-1 h-2 bg-white/10 rounded">
                            <div
                              className="h-2 rounded bg-cyan-400/70"
                              style={{ width: `${maxFreq ? Math.round((p.x / maxFreq) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-1 px-2 min-w-[90px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono w-8 text-right">{p.y}</span>
                          <div className="flex-1 h-2 bg-white/10 rounded">
                            <div
                              className="h-2 rounded bg-fuchsia-400/70"
                              style={{ width: `${maxVol ? Math.round((p.y / maxVol) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductMixQuadrantsTables;
