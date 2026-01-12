import React, { useEffect, useState } from "react";

type AccessDeniedProps = {
  title?: string;
  message?: string;
};

const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = "Acesso Negado",
  message = "Você não tem permissão para acessar esta página.",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 30);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-full p-12 overflow-hidden">
      {/* Background tech overlays */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_14px] opacity-[0.25]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:24px_100%] opacity-[0.15]" />
      </div>

      {/* Card */}
      <section
        className={[
          "relative w-full max-w-[720px] rounded-3xl",
          "border border-white/10 bg-dark-950/40 backdrop-blur-xl",
          "shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
          "transition-all duration-700 ease-out",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        ].join(" ")}
        role="alert"
        aria-live="polite"
      >
        {/* Neon edge */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-cyan-400/10 shadow-[0_0_0_1px_rgba(168,85,247,0.08),0_0_42px_rgba(34,211,238,0.10)]" />

        {/* Scanline shimmer */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
          <div
            className={[
              "absolute -left-1/3 top-0 h-full w-[60%]",
              "bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.18),transparent)]",
              "blur-md opacity-0",
              mounted ? "opacity-100 animate-[scan_3.2s_linear_infinite]" : "",
            ].join(" ")}
          />
        </div>

        <div className="relative p-8 sm:p-10">
          {/* Badge */}
          <div
            className={[
              "inline-flex items-center gap-2 rounded-full",
              "border border-rose-500/30 bg-rose-500/10 px-3 py-1",
              "text-[10px] font-bold uppercase tracking-[0.28em] text-rose-200",
              "transition-all duration-500",
              mounted ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <span className="inline-flex h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.55)]" />
            Segurança
          </div>

          <h1
            className={[
              "mt-4 text-3xl sm:text-4xl font-extrabold",
              "bg-gradient-to-r from-rose-300 via-rose-100 to-cyan-200 bg-clip-text text-transparent",
              "tracking-tight",
              "transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            ].join(" ")}
          >
            {title}
          </h1>

          <p
            className={[
              "mt-3 text-base sm:text-lg text-slate-300/90",
              "transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            ].join(" ")}
          >
            {message}
          </p>

          {/* Tech details */}
          <div
            className={[
              "mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3",
              "transition-all duration-700 delay-150",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            ].join(" ")}
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Status
              </div>
              <div className="mt-1 font-mono text-sm text-slate-200">403_FORBIDDEN</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Ação
              </div>
              <div className="mt-1 font-mono text-sm text-slate-200">ACCESS_BLOCKED</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Dica
              </div>
              <div className="mt-1 text-sm text-slate-300">Use uma conta autorizada.</div>
            </div>
          </div>

          {/* Actions */}
          <div
            className={[
              "mt-7 flex flex-col sm:flex-row gap-3",
              "transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={[
                "group inline-flex items-center justify-center gap-2",
                "rounded-2xl px-4 py-3",
                "border border-white/10 bg-white/[0.04]",
                "text-sm font-semibold text-slate-100",
                "transition-all duration-200",
                "hover:bg-white/[0.06] hover:border-cyan-400/30 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_26px_rgba(34,211,238,0.14)]",
                "focus:outline-none focus:ring-2 focus:ring-cyan-400/40",
              ].join(" ")}
              aria-label="Voltar para a página anterior"
            >
              <span className="font-mono opacity-70 group-hover:opacity-100 transition-opacity">⟵</span>
              Voltar
            </button>

            
          </div>
        </div>
      </section>

      {/* Local CSS animation (no dangerouslySetInnerHTML) */}
      <style>
        {`@keyframes scan{0%{transform:translateX(-60%)}100%{transform:translateX(220%)}}`}
      </style>
    </div>
  );
};

export default AccessDenied;