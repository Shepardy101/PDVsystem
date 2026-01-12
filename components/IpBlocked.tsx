import React from "react";
import { AlertTriangle } from "lucide-react";

const IpBlocked: React.FC<{ ip?: string; hostname?: string }> = ({ ip, hostname }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-dark-900 to-dark-950 text-center p-8">
    <div className="bg-dark-950/80 border border-accent/20 rounded-3xl shadow-2xl p-8 max-w-md animate-in fade-in">
      <div className="flex flex-col items-center gap-4">
        <AlertTriangle size={48} className="text-amber-400 animate-pulse" />
        <h1 className="text-2xl font-bold text-accent mb-2">Acesso Bloqueado</h1>
        <p className="text-slate-300 text-sm mb-2">
          Seu dispositivo (<span className="font-mono">{ip || "IP desconhecido"}</span>) está aguardando autorização do administrador para acessar o sistema.
        </p>
        {hostname && <p className="text-slate-500 text-xs">Hostname: {hostname}</p>}
        <p className="text-slate-500 text-xs mt-4">Se você é o administrador, autorize este IP no painel de controle.</p>
      </div>
    </div>
  </div>
);

export default IpBlocked;
