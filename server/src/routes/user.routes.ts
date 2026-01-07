import { Router } from 'express';
import { createUser, listUsers } from '../repositories/user.repo';

export const userRouter = Router();

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
  } catch (e) {
    console.error('[POST /api/users] Erro ao criar usuário:', e);
    res.status(500).json({ error: 'Erro ao criar usuário', details: e && e.message ? e.message : e });
  }
});
