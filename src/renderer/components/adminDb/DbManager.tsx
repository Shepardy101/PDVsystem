
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
	const [showResetModal, setShowResetModal] = useState(false);
	const [showSeedModal, setShowSeedModal] = useState(false);
	const [resetting, setResetting] = useState(false);
	const [resetResult, setResetResult] = useState<string | null>(null);

	return (
		<div className="flex h-full w-full bg-dark-950">
			{/* Modal de reset do banco */}
			{showResetModal && (
				<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-in fade-in">
					<div className="bg-dark-950 rounded-2xl shadow-2xl border border-accent/30 w-[400px] max-w-full p-8 relative flex flex-col items-center">
						<h2 className="text-lg font-bold text-red-500 mb-2">Resetar Banco de Dados</h2>
						<p className="text-slate-400 text-sm mb-4 text-center">Esta ação irá apagar <b>TODOS</b> os dados do sistema e criar um usuário root padrão.<br />Digite <b>RESET</b> para confirmar.</p>
						<input className="mb-4 px-3 py-2 rounded bg-dark-900 border border-white/10 text-white text-center" type="text" placeholder="Digite RESET" onChange={e => setResetResult(e.target.value)} disabled={resetting} />
						<div className="flex gap-2 w-full justify-center">
							<button className="btn btn-secondary" onClick={() => setShowResetModal(false)} disabled={resetting}>Cancelar</button>
							<button className="btn btn-danger" disabled={resetResult !== 'RESET' || resetting} onClick={async () => {
								setResetting(true);
								try {
									await resetDatabase();
									setResetResult('OK');
								} catch (e: any) {
									setResetResult('ERRO');
								} finally {
									setResetting(false);
								}
							}}>Resetar</button>
						</div>
						{resetResult === 'OK' && <div className="mt-4 text-green-500 font-bold">Banco resetado e root criado!</div>}
						{resetResult === 'ERRO' && <div className="mt-4 text-red-500 font-bold">Erro ao resetar banco.</div>}
					</div>
				</div>
			)}

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
					<button className="btn btn-primary !bg-cyan-600 !border-cyan-500" onClick={() => { setShowSeedModal(true); }}>
						Popular Demonstração (Mock)
					</button>
					<button className="btn btn-danger" onClick={() => { setShowResetModal(true); setResetResult(null); }}>
						Resetar Banco de Dados
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
