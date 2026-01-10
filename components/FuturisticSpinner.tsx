import React from 'react';

const FuturisticSpinner: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-dark-950 bg-cyber-grid p-6 relative overflow-hidden assemble-view">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-pulse" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg">
               <div className="flex flex-col items-center gap-6">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-accent border-solid" style={{ borderLeft: '4px solid #222', borderRight: '4px solid #222' }} />
                  <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">Aguardando status do terminal...</span>
               </div>
            </div>
         </div>
);

export default FuturisticSpinner;
