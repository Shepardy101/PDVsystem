const Database = require('better-sqlite3');
const db = new Database('data/novabev.sqlite');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);
const info = tables.map(name => ({
  name,
  count: db.prepare(`SELECT COUNT(*) AS c FROM "${name}"`).get().c,
  columns: db.prepare(`PRAGMA table_info("${name}")`).all().map(c => ({
    name: c.name,
    type: c.type,
    notnull: !!c.notnull,
    dflt: c.dflt_value,
    pk: !!c.pk,
  })),
}));
console.log(JSON.stringify(info, null, 2));
