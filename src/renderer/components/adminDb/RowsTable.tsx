
import React, { useEffect, useState } from 'react';
import { getRows, deleteRow, getSchema } from '../../features/adminDb/adminDbApi';
import { RowData, TableSchema } from '../../features/adminDb/types';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Props {
	table: string;
	onEditRow: (row: RowData | null) => void;
}

const RowsTable: React.FC<Props> = ({ table, onEditRow }) => {
	const [rows, setRows] = useState<RowData[]>([]);
	const [schema, setSchema] = useState<TableSchema | null>(null);
	const [loading, setLoading] = useState(true);

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

	const handleDelete = async (row: RowData) => {
		if (!window.confirm('Deseja realmente excluir este registro?')) return;
		await deleteRow(table, getPk(row));
		setRows(rows => rows.filter(r => !isSamePk(r, row)));
	};

	const getPk = (row: RowData) => {
		if (!schema) return {};
		const pkCols = schema.columns.filter(c => c.isPk).map(c => c.name);
		const pk: any = {};
		pkCols.forEach(col => { pk[col] = row[col]; });
		return pk;
	};

	const isSamePk = (a: RowData, b: RowData) => {
		if (!schema) return false;
		const pkCols = schema.columns.filter(c => c.isPk).map(c => c.name);
		return pkCols.every(col => a[col] === b[col]);
	};

	if (loading) return <div className="p-8 text-slate-500">Carregando...</div>;
	if (!schema) return <div className="p-8 text-slate-500">Schema não encontrado.</div>;

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between p-4 border-b border-white/10 bg-dark-950/80">
				<span className="font-bold text-accent">{table}</span>
				<button className="btn btn-accent btn-sm" onClick={() => onEditRow({})}>
					<Plus size={16} /> Novo Registro
				</button>
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
		</div>
	);
};

export default RowsTable;
