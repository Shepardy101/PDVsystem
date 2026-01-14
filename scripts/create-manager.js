const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'novabev.sqlite');
const db = new Database(dbPath);
const stmt = db.prepare("INSERT OR REPLACE INTO users (id,name,email,role,status,password,lastLogin) VALUES (@id,@name,@email,@role,@status,@password,NULL)");
stmt.run({ id: 'manager', name: 'Manager', email: 'manager', role: 'manager', status: 'active', password: 'manager' });
console.log('manager created/updated at', dbPath);
