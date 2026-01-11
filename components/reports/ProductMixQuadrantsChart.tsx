"use client";

import React, { useEffect, useRef, useState } from "react";
import { fetchProductMix } from "../../services/reports";
import {
  Chart,
  ScatterController,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(ScatterController, LinearScale, PointElement, Tooltip, Legend);

interface ProductPoint {
  x: number; // Frequência
  y: number; // Volume
  label: string;
  color?: string;
}

const palette = [
  "#c084fc",
  "#60a5fa",
  "#38bdf8",
  "#f472b6",
  "#facc15",
  "#4ade80",
  "#f87171",
  "#fbbf24",
  "#818cf8",
  "#f472b6",
];

const ProductMixQuadrantsTab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const [points, setPoints] = useState<ProductPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** ----------------------------------------------------------------------------
   * 1) BUSCA DOS DADOS DO BACKEND
   * ----------------------------------------------------------------------------
   */
  useEffect(() => {
    const now = Date.now();
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

    setLoading(true);

    fetchProductMix(now - THIRTY_DAYS, now)
      .then((data) => {
        const pts: ProductPoint[] = data.map((p: any, i: number) => ({
          x: p.frequency,
          y: p.total_quantity,
          label: p.product_name || p.name || "-",
          color: palette[i % palette.length],
        }));

        setPoints(pts);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Erro ao buscar dados");
        setLoading(false);
      });
  }, []);

  /** ----------------------------------------------------------------------------
   * 2) CONFIGURAÇÃO DO GRÁFICO DINÂMICO
   * ----------------------------------------------------------------------------
   */
  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;

    // Remove gráfico anterior
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    /** Dinamicamente calculamos limites reais das escalas */
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    const minX = Math.min(...xs) * 0.9;
    const maxX = Math.max(...xs) * 1.1;

    const minY = Math.min(...ys) * 0.9;
    const maxY = Math.max(...ys) * 1.1;

    /** Valor médio REAL — agora quadrantes funcionam com qualquer escala */
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    /** Plugin dos quadrantes redesenhado */
    const quadrantsPlugin = {
      id: "quadrants",
      afterDraw: (chart: any) => {
        const { ctx, chartArea, scales } = chart;

        const pxMid = scales.x.getPixelForValue(midX);
        const pyMid = scales.y.getPixelForValue(midY);

        ctx.save();
        ctx.strokeStyle = "#ffffff30";
        ctx.lineWidth = 2;

        // Linha vertical
        ctx.beginPath();
        ctx.moveTo(pxMid, chartArea.top);
        ctx.lineTo(pxMid, chartArea.bottom);
        ctx.stroke();

        // Linha horizontal
        ctx.beginPath();
        ctx.moveTo(chartArea.left, pyMid);
        ctx.lineTo(chartArea.right, pyMid);
        ctx.stroke();

        // Rótulos dos quadrantes
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#b388ff";
        ctx.fillText(
          "Venda pontual / oportunidade",
          chartArea.left + 10,
          chartArea.top + 20
        );
        ctx.fillText(
          "Parados / abaixo da média",
          chartArea.left + 10,
          chartArea.bottom - 10
        );

        ctx.fillStyle = "#66f3ff";
        ctx.fillText(
          "Reposição prior.",
          chartArea.right - 150,
          chartArea.top + 20
        );
        ctx.fillText(
          "Fluxo recorrente",
          chartArea.right - 150,
          chartArea.bottom - 10
        );

        ctx.restore();
      },
    };

    /** Criando gráfico */
    chartRef.current = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: points.map((p) => ({
          label: p.label,
          data: [{ x: p.x, y: p.y }],
          backgroundColor: p.color,
          borderColor: "#ffffff33",
          borderWidth: 2,
          radius: 7,
          hoverRadius: 10,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${points[ctx.datasetIndex].label} — Freq: ${ctx.parsed.x}, Vol: ${ctx.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            min: minX,
            max: maxX,
            grid: { color: "#ffffff15" },
            ticks: { color: "#66f3ff" },
            title: {
              display: true,
              text: "Frequência (nº vendas)",
              color: "#66f3ff",
              font: { weight: "bold" },
            },
          },
          y: {
            min: minY,
            max: maxY,
            grid: { color: "#ffffff15" },
            ticks: { color: "#b388ff" },
            title: {
              display: true,
              text: "Volume (unidades)",
              color: "#b388ff",
              font: { weight: "bold" },
            },
          },
        },
        animation: false,
      },
      plugins: [quadrantsPlugin],
    });
  }, [points]);

  /** ----------------------------------------------------------------------------
   * 3) RENDER DO COMPONENTE
   * ----------------------------------------------------------------------------
   */
  if (loading) return <div className="text-xs text-slate-400">Carregando gráfico...</div>;
  if (error) return <div className="text-xs text-red-400">Erro: {error}</div>;

  return (
    <div
      className="w-full max-w-2xl mx-auto bg-dark-900/40 border border-white/10 rounded-xl p-4 flex flex-col items-center overflow-x-auto"
      style={{ minHeight: 320 }}
    >
      <div
        className="w-full"
        style={{ aspectRatio: "2/1", minHeight: 220, maxHeight: 340 }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            maxWidth: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default ProductMixQuadrantsTab;
