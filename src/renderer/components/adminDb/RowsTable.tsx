
import React, { useEffect, useState } from 'react';
import { getRows, deleteRow, getSchema, exportTableData, wipeProductsTable } from '../../features/adminDb/adminDbApi';
import { RowData, TableSchema } from '../../features/adminDb/types';
import { Pencil, Trash2, Plus, FileSpreadsheet, ChevronDown, Trash } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
	table: string;
	onEditRow: (row: RowData | null) => void;
}

const RowsTable: React.FC<Props> = ({ table, onEditRow }) => {
	const [rows, setRows] = useState<RowData[]>([]);
	const [schema, setSchema] = useState<TableSchema | null>(null);
	const [loading, setLoading] = useState(true);
	const [exporting, setExporting] = useState(false);
	const [showExportMenu, setShowExportMenu] = useState(false);
	const [showWipeModal, setShowWipeModal] = useState(false);
	const [wipePassword, setWipePassword] = useState('');
	const [wipeConfirmation, setWipeConfirmation] = useState('');
	const [wiping, setWiping] = useState(false);

	useEffect(() => {
		setLoading(true);
		Promise.all([
			getRows(table),
			getSchema(table)
		]).then(([r, s]) => {
			setRows(r.rows);
			setSchema(s);
		}).finally(() => setLoading(false));
	}, [table]);

	// Fechar menu ao clicar fora
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (showExportMenu) {
				const target = e.target as HTMLElement;
				if (!target.closest('.export-menu-container')) {
					setShowExportMenu(false);
				}
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [showExportMenu]);

	const handleDelete = async (row: RowData) => {
		if (!window.confirm('Deseja realmente excluir este registro?')) return;
		await deleteRow(table, getPk(row));
		setRows(rows => rows.filter(r => !isSamePk(r, row)));
	};

	const handleExport = async (format: 'raw' | 'import' = 'raw') => {
		setExporting(true);
		setShowExportMenu(false);
		try {
			const data = await exportTableData(table, format);
			
			// Criar workbook e worksheet
			const ws = XLSX.utils.json_to_sheet(data.rows);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, table);
			
			// Nome do arquivo baseado no formato
			const formatSuffix = format === 'import' ? '_importacao' : '_completo';
			const fileName = `${table}${formatSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`;
			XLSX.writeFile(wb, fileName);
		} catch (error) {
			console.error('Erro ao exportar:', error);
			alert('Erro ao exportar dados');
		} finally {
			setExporting(false);
		}
	};

	const handleWipeProducts = async () => {
		setWiping(true);
		try {
			await wipeProductsTable(wipePassword, wipeConfirmation);
			alert('Tabela de produtos e serviços limpa com sucesso!');
			setShowWipeModal(false);
			setWipePassword('');
			setWipeConfirmation('');
			// Recarregar dados
			const r = await getRows(table);
			setRows(r.rows);
		} catch (error: any) {
			alert(error.message || 'Erro ao limpar tabela');
		} finally {
			setWiping(false);
		}
	};

	const getPk = (row: RowData) => {
		if (!schema) return {};
		const pkCols = schema.columns.filter(c => c.isPk).map(c => c.name);
		const pk: any = {};
		pkCols.forEach(col => { pk[col] = row[col]; });
		return pk;
	};

	const isSamePk = (r1: RowData, r2: RowData) => {
		if (!schema) return false;
		const pkCols = schema.columns.filter(c => c.isPk).map(c => c.name);
		return pkCols.every(col => r1[col] === r2[col]);
	};

	if (!schema) return <div className="p-8 text-slate-500">Carregando schema...</div>;

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
				<h2 className="text-sm font-bold text-white uppercase tracking-wider">{table}</h2>
				<div className="flex gap-2">
					{table === 'products' ? (
						<>
							<div className="relative export-menu-container">
								<button 
									className="btn btn-secondary btn-sm flex items-center gap-2" 
									onClick={() => setShowExportMenu(!showExportMenu)}
									disabled={exporting}
									title="Opções de Exportação"
								>
									<FileSpreadsheet size={16} />
									{exporting ? 'Exportando...' : 'Exportar XLS'}
									<ChevronDown size={14} />
								</button>
								{showExportMenu && (
									<div className="absolute right-0 top-full mt-1 bg-dark-900 border border-accent/30 rounded-lg shadow-xl z-50 min-w-[220px]">
										<button
											onClick={() => handleExport('raw')}
											className="w-full px-4 py-3 text-left text-sm hover:bg-accent/10 transition-colors border-b border-white/5 flex flex-col gap-1"
										>
											<span className="font-bold text-white">Dados Completos</span>
											<span className="text-xs text-slate-400">Todas as colunas do banco</span>
										</button>
										<button
											onClick={() => handleExport('import')}
											className="w-full px-4 py-3 text-left text-sm hover:bg-accent/10 transition-colors flex flex-col gap-1"
										>
											<span className="font-bold text-white">Formato Importação</span>
											<span className="text-xs text-slate-400">Pronto para importar novamente</span>
										</button>
									</div>
								)}
							</div>
							<button 
								className="btn btn-sm flex items-center gap-2 bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 hover:border-red-500/50" 
								onClick={() => setShowWipeModal(true)}
								title="Limpar Produtos e Serviços"
							>
								<Trash size={16} />
								Limpar Tabela
							</button>
						</>
					) : (
						<button 
							className="btn btn-secondary btn-sm flex items-center gap-2" 
							onClick={() => handleExport('raw')}
							disabled={exporting}
							title={`Exportar ${table} para Excel`}
						>
							<FileSpreadsheet size={16} />
							{exporting ? 'Exportando...' : 'Exportar XLS'}
						</button>
					)}
					<button className="btn btn-accent btn-sm" onClick={() => onEditRow({})}>
						<Plus size={16} /> Novo Registro
					</button>
				</div>
			</div>
			<div className="overflow-auto flex-1">
				<table className="min-w-full text-xs text-white">
					<thead className="bg-dark-900/80">
						<tr>
							{schema.columns.map(col => (
								<th key={col.name} className="px-2 py-2 font-bold text-left border-b border-white/10">{col.name}</th>
							))}
							<th className="px-2 py-2 font-bold text-left border-b border-white/10">Ações</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row, i) => (
							<tr key={i} className="hover:bg-accent/5">
								{schema.columns.map(col => (
									<td key={col.name} className="px-2 py-1 border-b border-white/10">{String(row[col.name] ?? '')}</td>
								))}
								<td className="px-2 py-1 border-b border-white/10 flex gap-2">
									<button className="text-accent hover:underline" onClick={() => onEditRow(row)} title="Editar"><Pencil size={14} /></button>
									<button className="text-red-500 hover:underline" onClick={() => handleDelete(row)} title="Excluir"><Trash2 size={14} /></button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{rows.length === 0 && <div className="p-8 text-slate-500">Nenhum registro encontrado.</div>}
			</div>

			{/* Modal de Confirmação para Limpar Tabela */}
			{showWipeModal && (
				<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-in fade-in">
					<div className="bg-dark-950 rounded-2xl shadow-2xl border border-red-500/30 w-[500px] max-w-full p-8 relative flex flex-col">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 bg-red-600/20 rounded-lg border border-red-500/30">
								<Trash className="text-red-500" size={24} />
							</div>
							<div>
								<h2 className="text-lg font-bold text-red-500">Limpar Tabela de Produtos e Serviços</h2>
								<p className="text-xs text-slate-500">Esta ação é IRREVERSÍVEL</p>
							</div>
						</div>

						<div className="bg-red-950/20 border border-red-500/20 rounded-lg p-4 mb-6">
							<p className="text-sm text-red-300 font-bold mb-2">⚠️ ATENÇÃO</p>
							<p className="text-xs text-slate-400">
								Esta ação irá remover <strong className="text-white">TODOS os produtos e serviços</strong> da tabela.
								Esta operação não pode ser desfeita.
							</p>
						</div>

						<div className="space-y-4 mb-6">
							<div>
								<label className="block text-xs font-bold text-slate-400 mb-2">
									Digite a senha de administrador:
								</label>
								<input
									type="password"
									value={wipePassword}
									onChange={(e) => setWipePassword(e.target.value)}
									placeholder="root@remove"
									className="w-full bg-dark-900/80 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-red-500 focus:outline-none"
									disabled={wiping}
								/>
								<p className="text-xs text-slate-500 mt-1">Senha: <code className="text-slate-400">root@remove</code></p>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-400 mb-2">
									Digite "wipe" para confirmar:
								</label>
								<input
									type="text"
									value={wipeConfirmation}
									onChange={(e) => setWipeConfirmation(e.target.value)}
									placeholder="wipe"
									className="w-full bg-dark-900/80 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-red-500 focus:outline-none"
									disabled={wiping}
								/>
							</div>
						</div>

						<div className="flex gap-4">
							<button 
								className="btn btn-secondary flex-1" 
								onClick={() => {
									setShowWipeModal(false);
									setWipePassword('');
									setWipeConfirmation('');
								}}
								disabled={wiping}
							>
								Cancelar
							</button>
							<button 
								className="btn flex-1 !bg-red-600 !border-red-500 hover:!bg-red-700 disabled:opacity-50" 
								onClick={handleWipeProducts}
								disabled={wiping || wipePassword !== 'root@remove' || wipeConfirmation !== 'wipe'}
							>
								{wiping ? 'Limpando...' : 'Limpar Tabela'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RowsTable;
