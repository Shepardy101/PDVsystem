import { Router } from 'express';
import db from '../../db/database';
import { logEvent } from '../../utils/audit';

const router = Router();

router.post('/purge-cache', (_req, res) => {
  try {
    const logsDeleted = db.prepare('DELETE FROM logs').run().changes;
    const pendingDeleted = db.prepare('DELETE FROM pending_ips').run().changes;
    logEvent('Purge cache executado', 'warn', { logsDeleted, pendingDeleted });
    res.json({ ok: true, logsDeleted, pendingDeleted });
  } catch (err: any) {
    console.error('[ADMIN][PURGE] Falha ao limpar cache:', err);
    res.status(500).json({ error: 'Erro ao limpar cache', details: err?.message || String(err) });
  }
});

export default router;
