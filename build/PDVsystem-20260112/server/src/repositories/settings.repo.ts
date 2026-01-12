import db from '../db/database';

export async function getSetting(key: string): Promise<string | null> {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value?: string } | undefined;
  return row && typeof row.value === 'string' ? row.value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  return Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
}
