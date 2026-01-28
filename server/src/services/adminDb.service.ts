// Reset database and create root user
export async function resetDatabase(req: Request, res: Response) {
	if (process.env.ENABLE_DB_ADMIN !== 'true') return res.status(404).send('Not found');
	const ip = (req.ip || req.connection.remoteAddress) ?? '';
	if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip)) return res.status(403).send('Forbidden');
	if (!req.body || req.body.confirm !== 'RESET') return res.status(400).json({ error: 'Confirmação obrigatória' });
	try {
		await adminDbRepo.resetDatabase();
		await adminDbRepo.createRootUser();
		// TODO: logar auditoria
		res.json({ ok: true, message: 'Banco resetado e usuário root criado.' });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
}
import { Request, Response, NextFunction } from 'express';
import * as adminDbRepo from '../repositories/adminDb.repo';

const SENSITIVE_TABLES = ['users', 'audit_trail', 'user', 'admin', 'sessions'];

export function guardAdminDb(req: Request, res: Response, next: NextFunction) {
	if (process.env.ENABLE_DB_ADMIN !== 'true') {
		console.warn(`[AdminDB] Tentativa de acesso bloqueada: ENABLE_DB_ADMIN não está como 'true'`);
		return res.status(404).json({ error: 'Funcionalidade administrativa desativada no ambiente.' });
	}
	const ip = (req.ip || req.connection.remoteAddress) ?? '';
	const allowedIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
	if (!allowedIps.includes(ip)) {
		console.warn(`[AdminDB] Acesso negado para o IP: ${ip}. Somente localhost permitido.`);
		return res.status(403).json({ error: 'Acesso restrito ao servidor local.', yourIp: ip });
	}
	next();
}

export async function getTables(req: Request, res: Response) {
	const tables = adminDbRepo.listTables();
	res.json(tables);
}

export async function getSchema(req: Request, res: Response) {
	const { table } = req.query;
	if (!table || typeof table !== 'string') return res.status(400).json({ error: 'Missing table' });
	try {
		const schema = adminDbRepo.getTableSchema(table);
		res.json(schema);
	} catch (e: any) {
		res.status(400).json({ error: e.message });
	}
}

export async function getRows(req: Request, res: Response) {
	const { table, limit = 50, offset = 0, orderBy, orderDir, search } = req.query;
	if (!table || typeof table !== 'string') return res.status(400).json({ error: 'Missing table' });
	try {
		const result = adminDbRepo.getRows({
			table,
			limit: Number(limit),
			offset: Number(offset),
			orderBy: orderBy as string,
			orderDir: orderDir as string,
			search: search as string,
		});
		res.json(result);
	} catch (e: any) {
		res.status(400).json({ error: e.message });
	}
}

export async function insertRow(req: Request, res: Response) {
	const { table, values } = req.body;
	if (!table || typeof table !== 'string' || typeof values !== 'object') return res.status(400).json({ error: 'Invalid body' });
	if (SENSITIVE_TABLES.includes(table)) return res.status(403).json({ error: 'Operation not allowed on sensitive table' });
	try {
		const result = adminDbRepo.insertRow(table, values);
		res.json({ ok: true, insertedId: result });
	} catch (e: any) {
		res.status(400).json({ error: e.message });
	}
}

export async function updateRow(req: Request, res: Response) {
	const { table, pk, values } = req.body;
	if (!table || typeof table !== 'string' || typeof pk !== 'object' || typeof values !== 'object') return res.status(400).json({ error: 'Invalid body' });
	if (SENSITIVE_TABLES.includes(table)) return res.status(403).json({ error: 'Operation not allowed on sensitive table' });
	try {
		const changes = adminDbRepo.updateRow(table, pk, values);
		res.json({ ok: true, changes });
	} catch (e: any) {
		res.status(400).json({ error: e.message });
	}
}

export async function deleteRow(req: Request, res: Response) {
	const { table, pk } = req.body;
	if (!table || typeof table !== 'string' || typeof pk !== 'object') return res.status(400).json({ error: 'Invalid body' });
	if (SENSITIVE_TABLES.includes(table)) return res.status(403).json({ error: 'Operation not allowed on sensitive table' });
	try {
		const changes = adminDbRepo.deleteRow(table, pk);
		res.json({ ok: true, changes });
	} catch (e: any) {
		res.status(400).json({ error: e.message });
	}
}

export async function queryBuilder(req: Request, res: Response) {
	const { table, select, where, orderBy, limit, offset } = req.body;
	if (!table || typeof table !== 'string') return res.status(400).json({ error: 'Missing table' });
	try {
		const result = adminDbRepo.queryBuilder({
			table,
			select,
			where,
			orderBy,
			limit,
			offset,
		});
		res.json(result);
	} catch (e: any) {
		res.status(400).json({ error: e.message });
	}
}
