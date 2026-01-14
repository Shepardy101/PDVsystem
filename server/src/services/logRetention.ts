import db from '../db/database';
import { logEvent } from '../utils/audit';

const DEFAULT_MAX_ROWS = 10000;
const DEFAULT_HOUR = 3; // 03:00 local

let lastPurgeDateKey: string | null = null;

function localDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function purgeIfNeeded(force = false) {
  try {
    const today = localDateKey();
    if (!force && lastPurgeDateKey === today) return;

    const maxRows = Number(process.env.LOG_MAX_ROWS || DEFAULT_MAX_ROWS);
    const totalRow = db.prepare('SELECT COUNT(*) as c FROM logs').get() as { c: number };
    const total = totalRow?.c ?? 0;
    if (total <= maxRows) {
      lastPurgeDateKey = today;
      return;
    }

    const overflow = total - maxRows;
    const stmt = db.prepare(
      'DELETE FROM logs WHERE id IN (SELECT id FROM logs ORDER BY created_at ASC LIMIT ?)' 
    );
    const changes = stmt.run(overflow).changes ?? 0;
    lastPurgeDateKey = today;
    logEvent('Logs purgados', 'warn', { removed: changes, kept: maxRows, totalBefore: total });
  } catch (err: any) {
    logEvent('Erro ao purgar logs', 'error', { message: err?.message || String(err), stack: err?.stack });
  }
}

function scheduleNextRun(afterMs: number) {
  setTimeout(() => {
    purgeIfNeeded();
    scheduleNextRun(24 * 60 * 60 * 1000); // 24h após cada execução
  }, afterMs);
}

export function scheduleLogRetention() {
  // Purga se ainda não rodou hoje (ou na primeira subida do dia)
  purgeIfNeeded(true);

  const now = new Date();
  const next = new Date();
  next.setHours(DEFAULT_HOUR, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  const delay = next.getTime() - now.getTime();
  scheduleNextRun(delay);
}
