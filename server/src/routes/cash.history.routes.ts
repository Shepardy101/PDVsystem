import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const cashHistoryRouter = Router();

// GET /api/cash/history - retorna todas as sessões de caixa (abertas e fechadas)
cashHistoryRouter.get('/history', (req: Request, res: Response) => {
  try {
    const sessions = db.prepare('SELECT * FROM cash_sessions ORDER BY opened_at DESC').all();
    res.json({ sessions });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao buscar histórico de caixas.' });
  }
});
