import db from '../db/database';

// Limpa todas as tabelas e cria usuário root
export async function resetDatabase() {
	const tables = listTables().map(t => t.name).filter(t => t !== 'sqlite_sequence');
	db.prepare('PRAGMA foreign_keys = OFF').run();
	for (const table of tables) {
		db.prepare(`DELETE FROM "${table}"`).run();
		try { db.prepare(`DELETE FROM sqlite_sequence WHERE name=?`).run(table); } catch {}
	}
	db.prepare('PRAGMA foreign_keys = ON').run();
}


export async function createRootUser() {
	const hasUserTable = listTables().some(t => t.name === 'users');
	if (!hasUserTable) throw new Error('Tabela de usuários não encontrada');
	// Remove root antigo se existir
	db.prepare('DELETE FROM users WHERE email = ?').run('root');
	db.prepare(`INSERT INTO users (id, name, email, role, status, password, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?)`)
		.run(
			'root',
			'Root',
			'root',
			'admin',
			'active',
			'root', // Troque por hash seguro em produção
			null
		);
}

function validateTable(table: string) {
	const tables = listTables().map(t => t.name);
	if (!tables.includes(table)) throw new Error('Invalid table');
}

function validateColumns(table: string, columns: string[]) {
	const schema = getTableSchema(table);
	const allowed = schema.columns.map(c => c.name);
	for (const col of columns) if (!allowed.includes(col)) throw new Error('Invalid column: ' + col);
}

export function listTables() {
	const rows = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`).all();
	return rows.map((r: any) => ({
		name: r.name,
		rowCount: (db.prepare(`SELECT COUNT(*) as cnt FROM "${r.name}"`).get() as { cnt: number }).cnt,
	}));
}

export function getTableSchema(table: string) {
	validateTable(table);
	const columns = db.prepare(`PRAGMA table_info("${table}")`).all();
	const foreignKeys = db.prepare(`PRAGMA foreign_key_list("${table}")`).all();
	return {
		table,
		columns: columns.map((c: any) => ({
			name: c.name,
			type: c.type,
			notNull: !!c.notnull,
			isPk: !!c.pk,
			defaultValue: c.dflt_value,
		})),
		foreignKeys: foreignKeys.length
			? foreignKeys.map((fk: any) => ({
					from: fk.from,
					table: fk.table,
					to: fk.to,
				}))
			: undefined,
	};
}

export function getRows({ table, limit = 50, offset = 0, orderBy, orderDir, search }: any) {
	validateTable(table);
	const schema = getTableSchema(table);
	let sql = `SELECT * FROM "${table}"`;
	const params: any[] = [];
	if (search) {
		const cols = schema.columns.filter((c: any) => c.type === 'TEXT').map((c: any) => c.name);
		if (cols.length) {
			sql += ' WHERE ' + cols.map(c => `"${c}" LIKE ?`).join(' OR ');
			params.push(...cols.map(() => `%${search}%`));
		}
	}
	if (orderBy && schema.columns.some((c: any) => c.name === orderBy)) {
		sql += ` ORDER BY "${orderBy}" ${orderDir === 'desc' ? 'DESC' : 'ASC'}`;
	}
	sql += ` LIMIT ? OFFSET ?`;
	params.push(Number(limit), Number(offset));
	const rows = db.prepare(sql).all(...params);
	const total = db.prepare(`SELECT COUNT(*) as cnt FROM "${table}"`).get().cnt;
	return { rows, total };
}

export function insertRow(table: string, values: Record<string, any>) {
	validateTable(table);
	const schema = getTableSchema(table);
	const cols = Object.keys(values);
	validateColumns(table, cols);
	const placeholders = cols.map(() => '?').join(',');
	const sql = `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders})`;
	const stmt = db.prepare(sql);
	const info = stmt.run(...cols.map(c => values[c]));
	return info.lastInsertRowid;
}

export function updateRow(table: string, pk: Record<string, any>, values: Record<string, any>) {
	validateTable(table);
	const schema = getTableSchema(table);
	const pkCols = schema.columns.filter((c: any) => c.isPk).map((c: any) => c.name);
	if (!pkCols.length) throw new Error('No PK');
	validateColumns(table, Object.keys(values));
	const set = Object.keys(values).map(c => `"${c}"=?`).join(',');
	const where = pkCols.map(c => `"${c}"=?`).join(' AND ');
	const sql = `UPDATE "${table}" SET ${set} WHERE ${where}`;
	const stmt = db.prepare(sql);
	const params = [...Object.keys(values).map(c => values[c]), ...pkCols.map(c => pk[c])];
	const info = stmt.run(...params);
	return info.changes;
}

export function deleteRow(table: string, pk: Record<string, any>) {
	validateTable(table);
	const schema = getTableSchema(table);
	const pkCols = schema.columns.filter((c: any) => c.isPk).map((c: any) => c.name);
	if (!pkCols.length) throw new Error('No PK');
	const where = pkCols.map(c => `"${c}"=?`).join(' AND ');
	const sql = `DELETE FROM "${table}" WHERE ${where}`;
	const stmt = db.prepare(sql);
	const params = pkCols.map(c => pk[c]);
	const info = stmt.run(...params);
	return info.changes;
}

export function queryBuilder({ table, select, where, orderBy, limit, offset }: any) {
	validateTable(table);
	const schema = getTableSchema(table);
	const cols = select && select.length ? select : schema.columns.map((c: any) => c.name);
	validateColumns(table, cols);
	let sql = `SELECT ${cols.map(c => `"${c}"`).join(',')} FROM "${table}"`;
	const params: any[] = [];
	if (where && Array.isArray(where) && where.length) {
		sql += ' WHERE ' + where.map((w: any) => {
			if (!schema.columns.some((c: any) => c.name === w.col)) throw new Error('Invalid where column');
			if (!['=', '!=', '<', '>', '<=', '>=', 'like'].includes(w.op)) throw new Error('Invalid op');
			params.push(w.value);
			return `"${w.col}" ${w.op} ?`;
		}).join(' AND ');
	}
	if (orderBy && orderBy.col && schema.columns.some((c: any) => c.name === orderBy.col)) {
		sql += ` ORDER BY "${orderBy.col}" ${orderBy.dir === 'desc' ? 'DESC' : 'ASC'}`;
	}
	if (limit) {
		sql += ` LIMIT ?`;
		params.push(Number(limit));
	}
	if (offset) {
		sql += ` OFFSET ?`;
		params.push(Number(offset));
	}
	const rows = db.prepare(sql).all(...params);
	return { rows };
}
