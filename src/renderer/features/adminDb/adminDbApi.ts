export async function resetDatabase() {
	const res = await fetch(BASE + '/reset', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ confirm: 'RESET' })
	});
	if (!res.ok) throw new Error('Erro ao resetar banco');
	return res.json();
}

export async function seedDemoDatabase() {
	const res = await fetch(BASE + '/seed-demo', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' }
	});
	if (!res.ok) throw new Error('Erro ao popular dados de demo');
	return res.json();
}


const BASE = '/api/admin-db';

function buildQuery(params: Record<string, any>) {
	const esc = encodeURIComponent;
	return Object.keys(params)
		.filter(k => params[k] !== undefined && params[k] !== null)
		.map(k => esc(k) + '=' + esc(params[k]))
		.join('&');
}

export async function listTables() {
	try {
		console.log('[DBManager] Buscando tabelas em', BASE + '/tables');
		const res = await fetch(BASE + '/tables');
		if (!res.ok) {
			console.error('[DBManager] Erro HTTP ao listar tabelas:', res.status, res.statusText);
			throw new Error('Erro ao listar tabelas');
		}
		const data = await res.json();
		console.log('[DBManager] Tabelas recebidas:', data);
		return data;
	} catch (err) {
		console.error('[DBManager] Falha ao buscar tabelas:', err);
		throw err;
	}
}

export async function getSchema(table: string) {
	const q = buildQuery({ table });
	const res = await fetch(BASE + '/schema?' + q);
	if (!res.ok) throw new Error('Erro ao buscar schema');
	return res.json();
}

export async function getRows(table: string, opts: any = {}) {
	const q = buildQuery({ table, ...opts });
	const res = await fetch(BASE + '/rows?' + q);
	if (!res.ok) throw new Error('Erro ao buscar registros');
	return res.json();
}

export async function insertRow(table: string, values: any) {
	const res = await fetch(BASE + '/rows', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ table, values })
	});
	if (!res.ok) throw new Error('Erro ao inserir registro');
	return res.json();
}

export async function updateRow(table: string, pk: any, values: any) {
	const res = await fetch(BASE + '/rows', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ table, pk, values })
	});
	if (!res.ok) throw new Error('Erro ao atualizar registro');
	return res.json();
}

export async function deleteRow(table: string, pk: any) {
	const res = await fetch(BASE + '/rows', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ table, pk })
	});
	if (!res.ok) throw new Error('Erro ao deletar registro');
	return res.json();
}

export async function queryBuilder(opts: any) {
	const res = await fetch(BASE + '/query', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(opts)
	});
	if (!res.ok) throw new Error('Erro ao executar query');
	return res.json();
}
export async function exportTableData(table: string, format: 'raw' | 'import' = 'raw') {
	const q = buildQuery({ table, format });
	const res = await fetch(BASE + '/export?' + q);
	if (!res.ok) throw new Error('Erro ao exportar dados');
	return res.json();
}