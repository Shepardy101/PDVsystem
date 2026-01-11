import { Request, Response, NextFunction } from 'express';
import * as adminDbRepo from '../repositories/adminDb.repo';

const SENSITIVE_TABLES = ['users', 'audit_trail', 'user', 'admin', 'sessions'];

export function guardAdminDb(req: Request, res: Response, next: NextFunction) {
	if (process.env.ENABLE_DB_ADMIN !== 'true') return res.status(404).send('Not found');
	const ip = (req.ip || req.connection.remoteAddress) ?? '';
	if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip)) return res.status(403).send('Forbidden');
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
