import { Router } from 'express';
import { createUser, listUsers, updateUser, deleteUser } from '../repositories/user.repo';

export const userRouter = Router();

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
