
import React, { useEffect, useState } from 'react';
import { getSchema, insertRow, updateRow } from '../../features/adminDb/adminDbApi';
import { TableSchema, RowData } from '../../features/adminDb/types';
import { Save, X } from 'lucide-react';

interface Props {
	open: boolean;
	row: RowData | null;
	onClose: () => void;
	table: string | null;
}

const RowEditorDrawer: React.FC<Props> = ({ open, row, onClose, table }) => {
	const [schema, setSchema] = useState<TableSchema | null>(null);
	const [form, setForm] = useState<RowData>({});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open && table) {
			getSchema(table).then(setSchema);
			setForm(row || {});
		}
	}, [open, table, row]);

	if (!open || !table || !schema) return null;

	const handleChange = (col: string, value: any) => {
		setForm(f => ({ ...f, [col]: value }));
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			if (row && Object.keys(row).length) {
				// update
				const pkCols = schema.columns.filter(c => c.isPk).map(c => c.name);
				const pk: any = {};
				pkCols.forEach(col => { pk[col] = row[col]; });
				await updateRow(table, pk, form);
			} else {
				// insert
				await insertRow(table, form);
			}
			onClose();
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className={`fixed top-0 right-0 h-full w-[400px] bg-dark-900 border-l border-accent/20 shadow-2xl z-50 transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
			<div className="flex items-center justify-between p-4 border-b border-white/10 bg-dark-950/80">
				<span className="font-bold text-accent">{row && Object.keys(row).length ? 'Editar Registro' : 'Novo Registro'}</span>
				<button onClick={onClose} className="text-slate-400 hover:text-accent transition-colors text-xs font-bold px-3 py-1 rounded-lg border border-white/10"><X size={16} /></button>
			</div>
			<form className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto custom-scrollbar-thin" onSubmit={e => { e.preventDefault(); handleSave(); }}>
				{schema.columns.map(col => (
					<div key={col.name} className="flex flex-col gap-1">
						<label className="text-xs text-slate-400 font-bold">{col.name}</label>
						<input
							className="bg-dark-950 border border-white/10 rounded px-2 py-1 text-white text-xs"
							type="text"
							value={form[col.name] ?? ''}
							onChange={e => handleChange(col.name, e.target.value)}
							disabled={col.isPk && row && Object.keys(row).length > 0}
						/>
					</div>
				))}
				<button type="submit" className="btn btn-accent mt-4 flex items-center gap-2 justify-center" disabled={saving}>
					<Save size={16} /> Salvar
				</button>
			</form>
		</div>
	);
};

export default RowEditorDrawer;
