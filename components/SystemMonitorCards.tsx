
import React, { useEffect, useMemo, useState } from "react";
import { Cpu, Activity, MemoryStick } from "lucide-react";
import { useBrowserPerformance } from "@/hooks/useBrowserPerformance";
import { formatBytes } from "../src/renderer/components/adminDb/formatters";


const neonBar = (percent: number, color: string) => (
  <div className="w-full h-2.5 bg-white/[0.04] rounded-full overflow-hidden relative border border-white/10">
    <div
      className="h-full rounded-full transition-all duration-700 ease-out"
      style={{
        width: `${Math.max(0, Math.min(100, percent))}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color}66 55%, transparent 95%)`,
        boxShadow: `0 0 12px ${color}1f`,
      }}
    />
    {/* brilho sutil no topo da barra */}
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent)] opacity-40" />
  </div>
);


// formatBytes agora está em formatters.ts

type Accent = "cyan" | "violet";

function accentClasses(accent: Accent) {
  if (accent === "violet") {
    return {
      icon: "text-violet-300",
      label: "text-violet-200/80",
      value: "text-slate-100",
      ringHover:
        "hover:shadow-[0_0_0_1px_rgba(168,85,247,0.16),0_0_28px_rgba(168,85,247,0.10)] hover:border-violet-400/25",
      dot: "bg-violet-400/80 shadow-[0_0_14px_rgba(168,85,247,0.35)]",
      barColor: "#a855f7",
    };
  }

  return {
    icon: "text-cyan-300",
    label: "text-cyan-200/80",
    value: "text-slate-100",
    ringHover:
      "hover:shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_28px_rgba(34,211,238,0.10)] hover:border-cyan-400/25",
    dot: "bg-cyan-400/80 shadow-[0_0_14px_rgba(34,211,238,0.35)]",
    barColor: "#22d3ee",
  };
}

function TechCard({
  accent,
  icon,
  title,
  children,
  footer,
  loading,
}: {
  accent: Accent;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
}) {
  const a = accentClasses(accent);

  return (
    <section
      className={[
        "group relative rounded-2xl border border-white/10",
        "bg-dark-950/35 backdrop-blur-xl",
        "shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        "transition-all duration-300 ease-out",
        a.ringHover,
        "animate-[fadeUp_380ms_ease-out]",
        "overflow-hidden",
      ].join(" ")}
    >
      {/* overlays tecnológicos (bem discretos) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_14px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:22px_100%] opacity-[0.35]" />
      </div>

      {/* “accent line” no topo */}
      <div
        className={[
          "pointer-events-none absolute left-4 right-4 top-3 h-px",
          accent === "violet" ? "bg-violet-400/25" : "bg-cyan-400/25",
          "blur-[0.2px]",
          "opacity-70 group-hover:opacity-100 transition-opacity",
        ].join(" ")}
      />

      <div className="relative p-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={["inline-flex h-2 w-2 rounded-full", a.dot].join(" ")} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={["shrink-0", a.icon].join(" ")}>{icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-300 truncate">
                  {title}
                </span>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.26em] text-slate-500">
                Monitoramento local
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-6 w-20 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
          ) : null}
        </header>

        <div className="mt-4">{children}</div>

        {footer ? (
          <footer className="mt-4 pt-4 border-t border-white/10 text-[10px] uppercase tracking-[0.26em] text-slate-500">
            {footer}
          </footer>
        ) : null}
      </div>

      {/* keyframes locais (sem libs) */}
      <style>{`@keyframes fadeUp{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  );
}

export const SystemMonitorCards: React.FC = () => {
  const [serverCpu, setServerCpu] = useState(0);
  const [serverMem, setServerMem] = useState({ used: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const browser = useBrowserPerformance(3000);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [cpuRes, memRes] = await Promise.all([
          fetch("/api/sys/cpu").then((r) => r.json()),
          fetch("/api/sys/mem").then((r) => r.json()),
        ]);

        if (!mounted) return;

        setServerCpu(cpuRes.cpu);
        setServerMem(memRes);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);


  const serverMemPct = useMemo(() => {
    if (!serverMem.total) return 0;
    return (serverMem.used / serverMem.total) * 100;
  }, [serverMem.total, serverMem.used]);

  // Corrigir cálculo e formatação para bytes
  const browserMemPct = useMemo(() => {
    if (!browser.jsHeapTotal) return 0;
    return (browser.jsHeapUsed / browser.jsHeapTotal) * 100;
  }, [browser.jsHeapTotal, browser.jsHeapUsed]);

  // Para debug manual: descomente para ver valores reais no console
  const DEBUG = false;
  if (DEBUG && browser.supported) {
    // Esperado: heapUsed ~ 50MB–500MB em uso normal, pode variar
    // Exemplo: 52428800 bytes = 50MB
    // Exemplo: 1073741824 bytes = 1GB
    // eslint-disable-next-line no-console
    console.log("[SystemMonitorCards] Browser heap:", {
      jsHeapUsed: browser.jsHeapUsed,
      jsHeapTotal: browser.jsHeapTotal,
      formattedUsed: formatBytes(browser.jsHeapUsed),
      formattedTotal: formatBytes(browser.jsHeapTotal),
      percent: browserMemPct,
    });
  }
function formatGB(bytes: number) {
    if (typeof bytes !== "number" || isNaN(bytes)) return "0 GB";
    return (bytes / (1024 ** 3)).toFixed(2) + " GB";
}

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
      {/* CPU Servidor */}
      <TechCard
        accent="cyan"
        icon={<Cpu size={18} />}
        title="CPU Servidor"
        loading={loading}
        footer="Atualiza a cada 3s"
      >
        <div className="flex items-end justify-between gap-3">
          <div className="text-3xl font-extrabold font-mono text-slate-100">
            {serverCpu}
            <span className="text-slate-500 text-xl">%</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.26em] text-slate-500">
            Uso atual
          </div>
        </div>

        <div className="mt-3">{neonBar(serverCpu, "#22d3ee")}</div>
      </TechCard>

      {/* RAM Servidor */}
      <TechCard
        accent="violet"
        icon={<MemoryStick size={18} />}
        title="RAM Servidor"
        loading={loading}
        footer="Uso / Total"
      >
        <div className="flex items-end justify-between gap-3">
          <div className="font-mono">
            <div className="text-xl font-extrabold text-slate-100">
              {formatGB(serverMem.used)}{" "}
              <span className="text-slate-500 font-semibold">/ {formatGB(serverMem.total)}</span>
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.26em] text-slate-500">
              Memória do servidor
            </div>
          </div>

          <div className="text-sm font-mono text-slate-300">
            {serverMemPct.toFixed(0)}%
          </div>
        </div>

        <div className="mt-3">{neonBar(serverMemPct, "#a855f7")}</div>
      </TechCard>

      {/* Navegador */}
      <TechCard
        accent="cyan"
        icon={<Activity size={18} />}
        title="Navegador"
        loading={loading}
        footer={browser.supported ? "Heap + CPU (estimado)" : "Sem suporte a performance.memory"}
      >
        {browser.supported ? (
          <>
            <div className="flex items-end justify-between gap-3">
              <div className="font-mono">
                <div className="text-xl font-extrabold text-slate-100">
                  {formatBytes(browser.jsHeapUsed)}{" "}
                  <span className="text-slate-500 font-semibold">/ {formatBytes(browser.jsHeapTotal)}</span>
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.26em] text-slate-500">
                  Memória JS (heap)
                </div>
              </div>
              <div className="text-sm font-mono text-slate-300">
                {browserMemPct.toFixed(0)}%
              </div>
            </div>

            <div className="mt-3">{neonBar(browserMemPct, "#22d3ee")}</div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.26em] text-slate-500">
                CPU (estimado)
              </div>
              <div className="font-mono text-lg font-bold text-slate-100">
                {browser.cpu}
                <span className="text-slate-500">%</span>
              </div>
            </div>

            <div className="mt-2">{neonBar(browser.cpu, "#22d3ee")}</div>
          </>
        ) : (
          <div className="text-slate-400 text-sm mt-2">
            performance.memory não suportado neste navegador.
          </div>
        )}
      </TechCard>
  
    </div>
  );
};

export default SystemMonitorCards;