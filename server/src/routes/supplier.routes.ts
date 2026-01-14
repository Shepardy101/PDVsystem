import { Router } from 'express';

import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { logEvent } from '../utils/audit';

type SupplierPayload = {
    name?: string;
    fantasy?: string;
    cnpj?: string;
    category?: string;
    email?: string;
    phone?: string;
    address?: string;
};

const router = Router();

// Listar fornecedores
router.get('/', (req, res) => {
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY name').all();
    res.json({ items: suppliers });
});

// Criar fornecedor
router.post('/', (req, res) => {
    const { name, fantasy, cnpj, category, email, phone, address } = (req.body as SupplierPayload);
    if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
    const incomingCnpj = (cnpj && String(cnpj).trim()) ? String(cnpj).trim() : '';
    const cnpjNormalized = incomingCnpj ? incomingCnpj.replace(/\D/g, '').padStart(5, '0') : '';
    if (cnpjNormalized) {
        const exists = db.prepare('SELECT id FROM suppliers WHERE cnpj = ?').get(cnpjNormalized);
        if (exists) {
            return res.status(409).json({ error: 'Já existe fornecedor com este CNPJ.' });
        }
    }
    const id = uuidv4();
    const now = Date.now();
    db.prepare(`INSERT INTO suppliers (id, name, cnpj, address, phone, email, category, created_at, updated_at, fantasy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, name, cnpjNormalized, address || '', phone || '', email || '', category || '', now, now, fantasy || '');
    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    logEvent('Fornecedor criado', 'info', { supplierId: id, name, cnpj: cnpjNormalized, category });
    res.json({ supplier });
});

// Atualizar fornecedor
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, fantasy, cnpj, category, email, phone, address } = (req.body as SupplierPayload);
    const existing = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id) as (SupplierPayload & { id: string; cnpj?: string; fantasy?: string; category?: string; email?: string; phone?: string; address?: string });
    if (!existing) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    if (!name) return res.status(400).json({ error: 'Nome obrigatório' });

    // Mantém CNPJ existente se não vier no payload; se vier vazio, limpa para ''
    const incomingCnpj = (cnpj === undefined || cnpj === null) ? (existing.cnpj ?? '') : String(cnpj).trim();
    const normalizedCnpj = incomingCnpj === '' ? '' : incomingCnpj.replace(/\D/g, '').padStart(5, '0');
    // Verifica duplicidade apenas se houver CNPJ após normalização
    if (normalizedCnpj) {
        const duplicate = db.prepare('SELECT id FROM suppliers WHERE cnpj = ? AND id != ?').get(normalizedCnpj, id);
        if (duplicate) {
            return res.status(409).json({ error: 'Já existe fornecedor com este CNPJ.' });
        }
    }

    const now = Date.now();
    db.prepare(`UPDATE suppliers SET name = ?, fantasy = ?, cnpj = ?, category = ?, email = ?, phone = ?, address = ?, updated_at = ? WHERE id = ?`)
        .run(
            name,
            fantasy ?? existing.fantasy ?? '',
            normalizedCnpj,
            category ?? existing.category ?? '',
            email ?? existing.email ?? '',
            phone ?? existing.phone ?? '',
            address ?? existing.address ?? '',
            now,
            id
        );

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    logEvent('Fornecedor atualizado', 'info', { supplierId: id, name, cnpj: normalizedCnpj, category });
    res.json({ supplier });
});

// Buscar fornecedor por id
router.get('/:id', (req, res) => {
    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json({ supplier });
});

// Remover fornecedor
router.delete('/:id', (req, res) => {
    try {
        console.log('[DELETE] Fornecedor id:', req.params.id);
        const allBefore = db.prepare('SELECT id, name FROM suppliers').all();
        console.log('[DELETE] Lista antes:', allBefore);
        const result = db.prepare('DELETE FROM suppliers WHERE id = ?').run(req.params.id);
        console.log('[DELETE] Result:', result);
        const allAfter = db.prepare('SELECT id, name FROM suppliers').all();
        console.log('[DELETE] Lista depois:', allAfter);
        logEvent('Fornecedor deletado', 'warn', { supplierId: req.params.id, removed: result.changes });
        res.json({ changes: result.changes, lastInsertRowid: result.lastInsertRowid });
    } catch (err) {
        logEvent('Erro ao remover fornecedor', 'error', {
            supplierId: req.params?.id,
            message: (err as any)?.message || String(err),
            stack: (err as any)?.stack
        });
        res.status(500).json({ error: 'Erro ao remover fornecedor', details: String(err) });
    }
});

export default router;
