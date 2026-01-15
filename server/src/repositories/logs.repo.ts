import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  message: string;
  level: LogLevel;
  context_json?: string | null;
  created_at: number;
}

export function addLog(message: string, level: LogLevel = 'info', context?: Record<string, unknown>): LogEntry {
  const entry: LogEntry = {
    id: uuidv4(),
    message: message.slice(0, 240), // evita textos longos
    level,
    context_json: context ? JSON.stringify(context).slice(0, 2000) : null,
    created_at: Date.now(),
  };
  db.prepare(
    `INSERT INTO logs (id, message, level, context_json, created_at)
     VALUES (@id, @message, @level, @context_json, @created_at)`
  ).run(entry);
  return entry;
}

export function listLogs(limit: number | 'all' = 100000, level?: LogLevel): LogEntry[] {
  if (limit === 'all') {
    if (level) {
      return db.prepare('SELECT * FROM logs WHERE level = ? ORDER BY created_at DESC').all(level) as LogEntry[];
    }
    return db.prepare('SELECT * FROM logs ORDER BY created_at DESC').all() as LogEntry[];
  }
  const safeLimit = Math.max(1, Math.min(500, typeof limit === 'number' ? limit : 100000));
  if (level) {
    return db.prepare(
      'SELECT * FROM logs WHERE level = ? ORDER BY created_at DESC LIMIT ?'
    ).all(level, safeLimit) as LogEntry[];
  }
  return db.prepare('SELECT * FROM logs ORDER BY created_at DESC LIMIT ?').all(safeLimit) as LogEntry[];
}
