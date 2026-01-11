
import React, { useEffect, useState } from 'react';
import { listTables } from '../../features/adminDb/adminDbApi';
import { TableInfo } from '../../features/adminDb/types';
import { Database, Search } from 'lucide-react';

interface Props {
	selected: string | null;
	onSelect: (table: string) => void;
	onQuery: () => void;
}

const TablesSidebar: React.FC<Props> = ({ selected, onSelect, onQuery }) => {
	const [tables, setTables] = useState<TableInfo[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		listTables().then(setTables).finally(() => setLoading(false));
	}, []);

	return (
		<aside className="w-64 bg-dark-900 border-r border-white/10 h-full flex flex-col">
			<div className="p-4 flex items-center gap-2 border-b border-white/10">
				<Database size={18} className="text-accent" />
				<span className="font-bold text-white text-sm">Tabelas</span>
				<button className="ml-auto text-xs text-accent hover:underline" onClick={onQuery} title="Query Builder">
					<Search size={16} />
				</button>
			</div>
			<div className="flex-1 overflow-y-auto custom-scrollbar-thin">
				{loading ? (
					<div className="p-4 text-slate-500 text-xs">Carregando...</div>
				) : tables.length === 0 ? (
					<div className="p-4 text-slate-500 text-xs">Nenhuma tabela encontrada.</div>
				) : (
					<ul>
						{tables.map(t => (
							<li key={t.name}>
								<button
									className={`w-full text-left px-4 py-2 hover:bg-accent/10 rounded flex items-center gap-2 ${selected === t.name ? 'bg-accent/20 text-accent font-bold' : 'text-white'}`}
									onClick={() => onSelect(t.name)}
								>
									{t.name}
									<span className="ml-auto text-xs text-slate-500">{t.rowCount}</span>
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</aside>
	);
};

export default TablesSidebar;
