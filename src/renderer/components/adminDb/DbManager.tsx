
import React, { useState } from 'react';
import TablesSidebar from './TablesSidebar';
import RowsTable from './RowsTable';
import RowEditorDrawer from './RowEditorDrawer';
import QueryBuilderPanel from './QueryBuilderPanel';

const DbManager: React.FC = () => {
	const [selectedTable, setSelectedTable] = useState<string | null>(null);
	const [editingRow, setEditingRow] = useState<any>(null);
	const [queryPanelOpen, setQueryPanelOpen] = useState(false);

	return (
		<div className="flex h-full w-full bg-dark-950">
			{/* Sidebar de tabelas */}
			<TablesSidebar selected={selectedTable} onSelect={setSelectedTable} onQuery={() => setQueryPanelOpen(true)} />
			{/* Conteúdo principal */}
			<div className="flex-1 flex flex-col min-w-0">
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
