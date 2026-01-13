import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../../../data');
const dbPath = path.join(dbDir, 'novabev.sqlite');
const migrationsDir = path.join(__dirname, 'migrations');

// Garante que a pasta data existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

function runMigrations() {
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`Executando migration: ${file}`);
    try {
      db.exec(sql);
    } catch (err) {
      const message = (err as Error)?.message || '';
      // Ignora erros de coluna já existente para permitir reexecução idempotente
      if (message.includes('duplicate column name') || message.includes('already exists')) {
        console.warn(`Migration ${file} ignorada (já aplicada): ${message}`);
        continue;
      }
      throw err;
    }
  }
  console.log('Todas as migrations foram aplicadas com sucesso!');
}

runMigrations();
