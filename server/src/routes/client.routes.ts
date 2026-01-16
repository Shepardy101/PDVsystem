import { Router } from 'express';
import { createClient, listClients, updateClient, deleteClient } from '../repositories/client.repo';
import { logEvent } from '../utils/audit';

const router = Router();

// Listar clientes
router.get('/', async (req, res) => {
  try {
    const clients = await listClients();
    res.json({ items: clients });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// Criar cliente
router.post('/', async (req, res) => {
  try {
    const { name, cpf, address, phone, email } = req.body;
    if (!name || !cpf) return res.status(400).json({ error: 'Nome e CPF obrigatórios' });
    try {
      const client = await createClient({ name, cpf, address, phone, email });
      logEvent('Cliente criado', 'info', { clientId: client.id, name, cpf });
      res.status(201).json({ client });
    } catch (err) {
      if (err && err.code === 'CPF_DUPLICATE') {
        logEvent('Erro ao criar cliente', 'warn', { payload: req.body, message: err.message });
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }
  } catch (e) {
    logEvent('Erro ao criar cliente', 'error', { payload: req.body, message: e?.message || String(e), stack: e?.stack });
    res.status(500).json({ error: 'Erro ao criar cliente', details: e && e.message ? e.message : e });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cpf, address, phone, email } = req.body;
    if (!name || !cpf) return res.status(400).json({ error: 'Nome e CPF obrigatórios' });
    try {
      const ok = await updateClient(id, { name, cpf, address, phone, email });
      if (ok) {
        logEvent('Cliente atualizado', 'info', { clientId: id, name, cpf });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Cliente não encontrado' });
      }
    } catch (err) {
      if (err && err.code === 'CPF_DUPLICATE') {
        logEvent('Erro ao atualizar cliente', 'warn', { clientId: id, message: err.message });
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }
  } catch (e) {
    logEvent('Erro ao atualizar cliente', 'error', { clientId: req.params?.id, message: e?.message || String(e), stack: e?.stack });
    res.status(500).json({ error: 'Erro ao atualizar cliente', details: e && e.message ? e.message : e });
  }
});

// Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await deleteClient(id);
    if (ok) {
      logEvent('Cliente deletado', 'info', { clientId: id });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }
  } catch (e) {
    logEvent('Erro ao deletar cliente', 'error', { clientId: req.params?.id, message: e?.message || String(e), stack: e?.stack });
    res.status(500).json({ error: 'Erro ao deletar cliente', details: e && e.message ? e.message : e });
  }
});

export default router;
