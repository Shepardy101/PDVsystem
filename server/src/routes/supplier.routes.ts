import { Router } from 'express';

import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

const router = Router();

// Listar fornecedores
router.get('/', (req, res) => {
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY name').all();
    res.json({ items: suppliers });
});

// Criar fornecedor
router.post('/', (req, res) => {
        const { name, fantasy, cnpj, category, email, phone, address } = req.body;
        if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
        const id = uuidv4();
        db.prepare(`INSERT INTO suppliers (id, name, fantasy, cnpj, category, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(id, name, fantasy || '', cnpj || '', category || '', email || '', phone || '', address || '');
        const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
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
        res.json({ changes: result.changes, lastInsertRowid: result.lastInsertRowid });
    } catch (err) {
        console.error('[DELETE] Erro ao remover fornecedor:', err);
        res.status(500).json({ error: 'Erro ao remover fornecedor', details: String(err) });
    }
});

export default router;
