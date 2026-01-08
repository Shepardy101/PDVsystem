import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const cashHistoryRouter = Router();

// GET /api/cash/history - retorna todas as sessões de caixa (abertas e fechadas)
cashHistoryRouter.get('/history', (req: Request, res: Response) => {
  try {
    const sessions = db.prepare('SELECT * FROM cash_sessions ORDER BY opened_at DESC').all();
    // For each session, calculate sales_total, sangrias_total, expected_balance, status
    const sessionsWithTotals = sessions.map((session: any) => {
      // Sales total
      const sales = db.prepare('SELECT total FROM sales WHERE cash_session_id = ?').all(session.id);
      const sales_total = sales.reduce((acc: number, s: any) => acc + (s.total || 0), 0);
      // Sangrias total
      const sangrias = db.prepare("SELECT amount FROM cash_movements WHERE cash_session_id = ? AND type = 'withdraw_out'").all(session.id);
      const sangrias_total = sangrias.reduce((acc: number, s: any) => acc + (s.amount || 0), 0);
      // Expected balance = initial_balance + suprimentos - sangrias
      const suprimentos = db.prepare("SELECT amount FROM cash_movements WHERE cash_session_id = ? AND type = 'supply_in'").all(session.id);
      const suprimentos_total = suprimentos.reduce((acc: number, s: any) => acc + (s.amount || 0), 0);
      const expected_balance = (session.initial_balance || 0) + suprimentos_total - sangrias_total;
      // Status: success if difference_at_close === 0 or null, danger otherwise
      let status = 'success';
      if (typeof session.difference_at_close === 'number' && session.difference_at_close !== 0) {
        status = 'danger';
      }
      return {
        ...session,
        sales_total,
        sangrias_total,
        expected_balance,
        status
      };
    });
    res.json({ sessions: sessionsWithTotals });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao buscar histórico de caixas.' });
  }
});
