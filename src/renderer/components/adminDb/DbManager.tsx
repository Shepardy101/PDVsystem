
import React, { useState } from 'react';
import { resetDatabase } from '../../features/adminDb/adminDbApi';
import TablesSidebar from './TablesSidebar';
import RowsTable from './RowsTable';
import RowEditorDrawer from './RowEditorDrawer';
import QueryBuilderPanel from './QueryBuilderPanel';


const DbManager: React.FC = () => {
	const [selectedTable, setSelectedTable] = useState<string | null>(null);
	const [editingRow, setEditingRow] = useState<any>(null);
	const [queryPanelOpen, setQueryPanelOpen] = useState(false);
	const [showSeedModal, setShowSeedModal] = useState(false);
	const [resetting, setResetting] = useState(false);

	return (
		<div className="flex h-full w-full bg-dark-950">
			

			{/* Modal de Seed Demo */}
			{showSeedModal && (
				<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-in fade-in">
					<div className="bg-dark-950 rounded-2xl shadow-2xl border border-accent/30 w-[450px] max-w-full p-8 relative flex flex-col items-center">
						<h2 className="text-lg font-bold text-cyan-500 mb-2">Popular Demonstração</h2>
						<p className="text-slate-400 text-sm mb-6 text-center">Isso irá **apagar os dados atuais** e inserir 30 dias de histórico fictício (Jan/2026), 50+ produtos e 2 operadores. Deseja continuar?</p>

						{resetting ? (
							<div className="flex flex-col items-center py-4">
								<div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
								<p className="text-cyan-500 font-medium animate-pulse">Gerando histórico de 30 dias...</p>
							</div>
						) : (
							<div className="flex gap-4 w-full justify-center">
								<button className="btn btn-secondary flex-1" onClick={() => setShowSeedModal(false)}>Cancelar</button>
								<button className="btn btn-primary flex-1 !bg-cyan-600 !border-cyan-500" onClick={async () => {
									setResetting(true);
									try {
										const { seedDemoDatabase } = await import('../../features/adminDb/adminDbApi');
										await seedDemoDatabase();
										window.location.reload(); // Recarrega para ver os novos dados
									} catch (e: any) {
										alert('Erro ao popular dados: ' + e.message);
										setResetting(false);
									}
								}}>Confirmar e Popular</button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Sidebar de tabelas */}
			<TablesSidebar selected={selectedTable} onSelect={setSelectedTable} onQuery={() => setQueryPanelOpen(true)} />
			{/* Conteúdo principal + botões de ação */}
			<div className="flex-1 flex flex-col min-w-0">
				<div className="flex justify-end p-2 gap-4">
					<button
						className="btn btn-icon border-cyan-500! bg-cyan-600! text-cyan-100 hover:bg-cyan-700! hover:border-cyan-600! transition"
						title="Popular Demonstração (Mock)"
						aria-label="Popular Demonstração (Mock)"
						onClick={() => setShowSeedModal(true)}
					>
						{/* Ícone Lucide: Database */}
						<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<ellipse cx="12" cy="5" rx="9" ry="3" />
							<path d="M3 5v6c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
							<path d="M3 11v6c0 1.657 4.03 3 9 3s9-1.343 9-3v-6" />
						</svg>
					</button>
				</div>
				{selectedTable ? (
					<RowsTable table={selectedTable} onEditRow={setEditingRow} />
				) : (
					<div className="flex-1 flex items-center justify-center text-slate-600 text-sm">Selecione uma tabela para visualizar os dados.</div>
				)}
			</div>
			{/* Drawer de edição */}
			<RowEditorDrawer open={!!editingRow} row={editingRow} onClose={() => setEditingRow(null)} table={selectedTable} />
			{/* Painel de query builder */}
			<QueryBuilderPanel open={queryPanelOpen} onClose={() => setQueryPanelOpen(false)} />
		</div>
	);
};

export default DbManager;
