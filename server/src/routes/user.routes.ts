import { Router } from 'express';
import { createUser, listUsers, updateUser, deleteUser, findUserByEmail } from '../repositories/user.repo';
import { db } from '../db/database';

import { createClient, listClients, updateClient, deleteClient } from '../repositories/client.repo';
import { createSupplier, updateSupplier, deleteSupplier, listSuppliers } from '../repositories/supplier.repo';

export const userRouter = Router();
export const clientRouter = Router();
export const supplierRouter = Router();
// Buscar nome do operador pelo ID
userRouter.get('/operator/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT name FROM users WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: 'Operador não encontrado' });
    }
    console.log('response operator name:', row);
    res.json({ name: (row as { name: string }).name });
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao buscar operador', details: e && e.message ? e.message : e });
  }
});


// Login simples
userRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha obrigatórios' });
    }
    const user = await findUserByEmail(email) as { id: string, name: string, email: string, password: string } | undefined;
    console.log('[LOGIN] Email recebido:', email);
    console.log('[LOGIN] Senha recebida:', password);
    if (user) {
      console.log('[LOGIN] Senha salva no banco:', user.password);
    } else {
      console.log('[LOGIN] Usuário não encontrado para o email:', email);
    }
    if (!user || user.password !== password) {
      console.log('[LOGIN] Falha na autenticação.');
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    // Retorna dados básicos do usuário
    console.log('[LOGIN] Autenticação bem-sucedida para:', email);
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao autenticar', details: e?.message || String(e) });
  }
});

userRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    const ok = await updateUser(id, { name, email, role, status });
    if (ok) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (e: any) {
    console.error('[PUT /api/users/:id] Erro ao atualizar usuário:', e);
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: e && e.message ? e.message : e });
  }
});

userRouter.get('/', async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

userRouter.post('/', async (req, res) => {
  try {
    const { name, email, role, status, password } = req.body;
    console.log('[POST /api/users] body:', req.body);
    if (!name || !email || !role || !password) {
      console.warn('[POST /api/users] Campos obrigatórios ausentes:', req.body);
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    const user = await createUser({ name, email, role, status, password });
    console.log('[POST /api/users] Usuário criado:', user);
    res.status(201).json(user);
  } catch (e: any) {
    console.error('[POST /api/users] Erro ao criar usuário:', e);
    res.status(500).json({ error: 'Erro ao criar usuário', details: e && e.message ? e.message : e });
  }
});

userRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await deleteUser(id);
    if (ok) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (e: any) {
    console.error('[DELETE /api/users/:id] Erro ao deletar usuário:', e);
    res.status(500).json({ error: 'Erro ao deletar usuário', details: e && e.message ? e.message : e });
  }
});

clientRouter.get('/', async (req, res) => {
  try {
    // Retorna clientes com totalSpent
    const { listClientsWithTotalSpent } = require('../repositories/client.repo');
    const clients = await listClientsWithTotalSpent();
    res.json(clients);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

clientRouter.post('/', async (req, res) => {
  try {
    const { name, cpf, address, phone, email } = req.body;
    if (!name || !cpf) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    const client = await createClient({ name, cpf, address, phone, email });
    res.status(201).json(client);
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao criar cliente', details: e && e.message ? e.message : e });
  }
});

clientRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cpf, address, phone, email } = req.body;
    if (!name || !cpf) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    const ok = await updateClient(id, { name, cpf, address, phone, email });
    if (ok) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao atualizar cliente', details: e && e.message ? e.message : e });
  }
});

clientRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await deleteClient(id);
    if (ok) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }
  } catch (e: any) {
    console.error('[DELETE /api/clients/:id] Erro ao deletar cliente:', e);
    res.status(500).json({ error: 'Erro ao deletar cliente', details: e && e.message ? e.message : e });
  }
});

supplierRouter.get('/', async (req, res) => {
  try {
    const suppliers = await listSuppliers();
    res.json(suppliers);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar fornecedores' });
  }
});

supplierRouter.post('/', async (req, res) => {
  try {
    const { name, cnpj, address, phone, email, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    const supplier = await createSupplier({ name, cnpj, address, phone, email, category });
    res.status(201).json(supplier);
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao criar fornecedor', details: e && e.message ? e.message : e });
  }
});

supplierRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cnpj, address, phone, email, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    const ok = await updateSupplier(id, { name, cnpj, address, phone, email, category });
    if (ok) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao atualizar fornecedor', details: e && e.message ? e.message : e });
  }
});

supplierRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await deleteSupplier(id);
    if (ok) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao deletar fornecedor', details: e && e.message ? e.message : e });
  }
});
