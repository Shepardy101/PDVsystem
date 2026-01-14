import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import { pipeline } from 'stream/promises';
import zlib from 'zlib';
import db from '../db/database';
import { logEvent } from '../utils/audit';

const DEFAULT_MAX_ROWS = 10000;
const DEFAULT_HOUR = 3; // 03:00 local
const DEFAULT_EXPORT_WINDOW_HOURS = 24;
const DEFAULT_SEND_TIMEOUT_MS = 5000;

let lastPurgeDateKey: string | null = null;

function localDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function gzipFileToBuffer(filePath: string): Promise<Buffer> {
  const source = fs.createReadStream(filePath);
  const chunks: Buffer[] = [];
  const gzip = zlib.createGzip();
  const collector = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(Buffer.from(chunk));
      cb();
    },
  });
  await pipeline(source, gzip, collector);
  return Buffer.concat(chunks);
}

async function sendBufferToWebhook(body: Buffer, contentType: string, metadata: Record<string, unknown>) {
  const url = process.env.BACKUP_WEBHOOK_URL;
  if (!url) return;
  const token = process.env.BACKUP_WEBHOOK_TOKEN;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getNumberEnv('BACKUP_SEND_TIMEOUT_MS', DEFAULT_SEND_TIMEOUT_MS));
  const payload = new Uint8Array(body);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: payload,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      logEvent('Backup webhook falhou', 'error', { status: res.status, statusText: res.statusText, ...metadata });
    } else {
      logEvent('Backup enviado', 'info', metadata);
    }
  } catch (err: any) {
    clearTimeout(timeout);
    logEvent('Backup webhook erro', 'error', { message: err?.message || String(err), stack: err?.stack, ...metadata });
  }
}

async function exportLogsWindowAndSend() {
  const hours = getNumberEnv('LOG_EXPORT_WINDOW_HOURS', DEFAULT_EXPORT_WINDOW_HOURS);
  const since = Date.now() - hours * 60 * 60 * 1000;
  const rows = db.prepare('SELECT * FROM logs WHERE created_at >= ? ORDER BY created_at ASC').all(since);
  if (!rows || rows.length === 0) {
    logEvent('Backup de logs - nada para enviar', 'info', { windowHours: hours });
    return;
  }
  const payload = Buffer.from(JSON.stringify({ logs: rows }));
  await sendBufferToWebhook(payload, 'application/json', { windowHours: hours, count: rows.length });
}

async function exportDbSnapshotAndSend() {
  const url = process.env.BACKUP_WEBHOOK_URL;
  if (!url) return;
  const dataDir = path.resolve(__dirname, '../../data');
  const snapshotPath = path.join(dataDir, `logs-backup-${Date.now()}.sqlite`);
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    db.exec(`VACUUM INTO '${snapshotPath.replace(/'/g, "''")}'`);
    const gz = await gzipFileToBuffer(snapshotPath);
    await sendBufferToWebhook(gz, 'application/gzip', { snapshot: path.basename(snapshotPath), size: gz.length });
  } catch (err: any) {
    logEvent('Erro ao gerar/enviar snapshot', 'error', { message: err?.message || String(err), stack: err?.stack });
  } finally {
    try { fs.existsSync(snapshotPath) && fs.unlinkSync(snapshotPath); } catch {}
  }
}

function purgeIfNeeded(force = false) {
  try {
    const today = localDateKey();
    if (!force && lastPurgeDateKey === today) return;

    const maxRows = getNumberEnv('LOG_MAX_ROWS', DEFAULT_MAX_ROWS);
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

async function runDailyMaintenance(force = false) {
  const today = localDateKey();
  if (!force && lastPurgeDateKey === today) return;
  try {
    // Envia logs das últimas 24h e snapshot do banco (leve gzip)
    await exportLogsWindowAndSend();
    await exportDbSnapshotAndSend();
  } catch (err: any) {
    logEvent('Erro ao executar backup diário', 'error', { message: err?.message || String(err), stack: err?.stack });
  } finally {
    purgeIfNeeded(true);
  }
}

function scheduleNextRun(afterMs: number) {
  setTimeout(() => {
    void runDailyMaintenance();
    scheduleNextRun(24 * 60 * 60 * 1000); // 24h após cada execução
  }, afterMs);
}

export function scheduleLogRetention() {
  // Executa backup + purge na subida (garante que roda mesmo se máquina ficou desligada)
  void runDailyMaintenance(true);

  const now = new Date();
  const next = new Date();
  next.setHours(DEFAULT_HOUR, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  const delay = next.getTime() - now.getTime();
  scheduleNextRun(delay);
}
