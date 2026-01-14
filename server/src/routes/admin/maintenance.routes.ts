import { Router } from 'express';
import db from '../../db/database';
import { logEvent } from '../../utils/audit';
import { guardAdminDb } from '../../services/adminDb.service';
import * as adminDbRepo from '../../repositories/adminDb.repo';

const router = Router();

// Protege todas as rotas de manutenção
router.use(guardAdminDb);

router.post('/purge-cache', (_req, res) => {
  try {
    const logsDeleted = db.prepare('DELETE FROM logs').run().changes;
    const pendingDeleted = db.prepare('DELETE FROM pending_ips').run().changes;
    logEvent('Purge cache executado', 'warn', { logsDeleted, pendingDeleted });
    res.json({ ok: true, logsDeleted, pendingDeleted });
  } catch (err: any) {
    logEvent('Erro ao purgar cache', 'error', {
      message: err?.message || String(err),
      stack: err?.stack
    });
    res.status(500).json({ error: 'Erro ao limpar cache', details: err?.message || String(err) });
  }
});

// Wipe de dados: mantém settings e schema_version, recria root
router.post('/wipe-local', async (_req, res) => {
  try {
    db.exec('PRAGMA foreign_keys = OFF');
    const keepData = new Set(['settings', 'schema_version']);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map((r: any) => r.name);
    const cleared: Record<string, number> = {};

    for (const table of tables) {
      if (keepData.has(table)) continue;
      if (table === 'users') continue; // tratar separado
      const result = db.prepare(`DELETE FROM "${table}"`).run();
      cleared[table] = result.changes ?? 0;
      try { db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run(table); } catch {}
    }

    // Reset usuários e cria root
    db.prepare('DELETE FROM users').run();
    await adminDbRepo.createRootUser();
    cleared['users'] = 1;

    db.exec('PRAGMA foreign_keys = ON');
    logEvent('Wipe local executado', 'warn', { clearedTables: Object.keys(cleared) });
    res.json({ ok: true, cleared });
  } catch (err: any) {
    db.exec('PRAGMA foreign_keys = ON');
    logEvent('Erro ao executar wipe-local', 'error', {
      message: err?.message || String(err),
      stack: err?.stack
    });
    res.status(500).json({ error: 'Erro ao limpar dados', details: err?.message || String(err) });
  }
});

export default router;
