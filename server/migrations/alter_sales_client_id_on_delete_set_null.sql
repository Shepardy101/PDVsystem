-- Altera a restrição da coluna client_id em sales para ON DELETE SET NULL
PRAGMA foreign_keys=off;

CREATE TABLE sales_new (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  operator_id TEXT NOT NULL,
  cash_session_id TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  discount_total INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed')),
  created_at INTEGER NOT NULL,
  client_id TEXT NULL,
  FOREIGN KEY(cash_session_id) REFERENCES cash_sessions(id),
  FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE SET NULL
);

INSERT INTO sales_new SELECT * FROM sales;
DROP TABLE sales;
ALTER TABLE sales_new RENAME TO sales;
PRAGMA foreign_keys=on;
