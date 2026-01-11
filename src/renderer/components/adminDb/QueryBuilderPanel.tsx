
import React from 'react';

interface Props {
	open: boolean;
	onClose: () => void;
}

const QueryBuilderPanel: React.FC<Props> = ({ open, onClose }) => {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-in fade-in">
			<div className="bg-dark-950 rounded-2xl shadow-2xl border border-accent/30 w-[600px] max-w-full p-8 relative">
				<button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-accent text-xs font-bold px-3 py-1 rounded-lg border border-white/10">Fechar</button>
				<h2 className="text-lg font-bold text-accent mb-4">Query Builder (em breve)</h2>
				<div className="text-slate-400 text-sm">Ferramenta para montar consultas avançadas. (Funcionalidade em desenvolvimento)</div>
			</div>
		</div>
	);
};

export default QueryBuilderPanel;
