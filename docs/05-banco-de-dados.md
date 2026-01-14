# 05 - Banco de Dados (SQLite)

## Conexão e PRAGMAs
- DB: `data/novabev.sqlite` (criado se ausente). Fonte: `server/src/db/database.ts`.
- PRAGMAs aplicados: `journal_mode=WAL`, `foreign_keys=ON`.

## Tabelas (segundo migrations visíveis)
### schema_version
- `version INTEGER NOT NULL`
- `applied_at INTEGER NOT NULL`

### categories
- `id TEXT PK`
- `name TEXT UNIQUE NOT NULL`
- `created_at INTEGER`
- `updated_at INTEGER`

### suppliers
- `id TEXT PK`
- `name TEXT NOT NULL`
- `cnpj TEXT UNIQUE`
- `address TEXT`
- `phone TEXT`
- `email TEXT`
- `category TEXT`
- `created_at INTEGER`
- `updated_at INTEGER`

### products (após 0023)
- `id TEXT PK`
- `name TEXT NOT NULL`
- `ean TEXT UNIQUE NULL`
- `internal_code TEXT UNIQUE NULL`
- `unit TEXT NOT NULL CHECK(unit IN ('cx','unit','kg','serv'))`
- `cost_price INTEGER NOT NULL DEFAULT 0`
- `sale_price INTEGER NOT NULL DEFAULT 0`
- `auto_discount_enabled INTEGER NOT NULL DEFAULT 0`
- `auto_discount_value INTEGER NOT NULL DEFAULT 0`
- `category_id TEXT FK categories(id) ON UPDATE CASCADE ON DELETE SET NULL`
- `supplier_id TEXT FK suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL`
- `status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive'))`
- `stock_on_hand INTEGER NOT NULL DEFAULT 0`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`
- `imageUrl TEXT`
- `type TEXT DEFAULT 'product'`
- `min_stock INTEGER NOT NULL DEFAULT 20`

### sales (0001)
- `id TEXT PK`
- `timestamp INTEGER NOT NULL` (epoch ms)
- `operator_id TEXT NOT NULL`
- `cash_session_id TEXT NOT NULL FK cash_sessions(id)`
- `subtotal INTEGER NOT NULL`
- `discount_total INTEGER NOT NULL`
- `total INTEGER NOT NULL`
- `status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed'))`
- `created_at INTEGER NOT NULL`

### sale_items (após 0021/0022)
- `id TEXT PK`
- `sale_id TEXT NOT NULL FK sales(id) ON DELETE CASCADE`
- `product_id TEXT NOT NULL FK products(id)`
- `product_name_snapshot TEXT NOT NULL`
- `product_internal_code_snapshot TEXT NOT NULL`
- `product_ean_snapshot TEXT NOT NULL`
- `unit_snapshot TEXT NOT NULL CHECK(unit_snapshot IN ('cx','unit','kg','serv'))`
- `quantity INTEGER NOT NULL`
- `unit_price_at_sale INTEGER NOT NULL`
- `auto_discount_applied INTEGER NOT NULL DEFAULT 0`
- `manual_discount_applied INTEGER NOT NULL DEFAULT 0`
- `final_unit_price INTEGER NOT NULL`
- `line_total INTEGER NOT NULL`

### payments (0001)
- `id TEXT PK`
- `sale_id TEXT NOT NULL FK sales(id) ON DELETE CASCADE`
- `method TEXT NOT NULL CHECK(method IN ('cash','pix','card','other'))`
- `amount INTEGER NOT NULL` (centavos)
- `metadata_json TEXT NULL`
- `created_at INTEGER NOT NULL`

### stock_movements (0001)
- `id TEXT PK`
- `product_id TEXT NOT NULL FK products(id)`
- `type TEXT NOT NULL CHECK(type IN ('sale_out','manual_in','manual_out','adjustment','import_in'))`
- `quantity INTEGER NOT NULL`
- `reason TEXT NOT NULL`
- `reference_type TEXT NOT NULL CHECK(reference_type IN ('sale','import','manual'))`
- `reference_id TEXT NULL`
- `timestamp INTEGER NOT NULL`

### cash_sessions (0001)
- `id TEXT PK`
- `operator_id TEXT NOT NULL`
- `opened_at INTEGER NOT NULL`
- `closed_at INTEGER NULL`
- `initial_balance INTEGER NOT NULL DEFAULT 0`
- `is_open INTEGER NOT NULL DEFAULT 1`
- `physical_count_at_close INTEGER NULL`
- `difference_at_close INTEGER NULL`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`

### cash_movements (0001)
- `id TEXT PK`
- `cash_session_id TEXT NOT NULL FK cash_sessions(id) ON DELETE CASCADE`
- `type TEXT NOT NULL CHECK(type IN ('sale_inflow','supply_in','withdraw_out','adjustment'))`
- `direction TEXT NOT NULL CHECK(direction IN ('in','out'))`
- `amount INTEGER NOT NULL`
- `description TEXT NOT NULL`
- `timestamp INTEGER NOT NULL`
- `reference_type TEXT NOT NULL CHECK(reference_type IN ('sale','manual'))`
- `reference_id TEXT NULL`
- `metadata_json TEXT NULL`
- `created_at INTEGER NOT NULL`

### users (0004)
- `id TEXT PK`
- `name TEXT NOT NULL`
- `email TEXT NOT NULL UNIQUE`
- `role TEXT NOT NULL CHECK(role IN ('admin','operator','manager'))`
- `status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','blocked'))`
- `password TEXT NOT NULL`
- `lastLogin INTEGER`

### clients (0005)
- `id TEXT PK`
- `name TEXT NOT NULL`
- `email TEXT`
- `phone TEXT`
- `address TEXT`
- `created_at INTEGER`
- `updated_at INTEGER`

### settings (0010)
- `key TEXT PK`
- `value TEXT NOT NULL`
- Seeds: `('admin_password','admin123')`, `('can_approve_movements','true')`

### allowed_ips / pending_ips (0011, 0025, 0026)
- `allowed_ips`: `id INTEGER PK AUTOINCREMENT`, `ip TEXT NOT NULL UNIQUE`, `hostname TEXT`, `autorizado_em DATETIME DEFAULT CURRENT_TIMESTAMP`, `autorizado_por TEXT`.
- `pending_ips`: `id INTEGER PK AUTOINCREMENT`, `ip TEXT NOT NULL UNIQUE`, `hostname TEXT`, `user_agent TEXT`, `requested_path TEXT`, `request_method TEXT`, `referer TEXT`, `accept_language TEXT`, `accept_header TEXT`, `accept_encoding TEXT`, `forwarded_for_raw TEXT`, `remote_port INTEGER`, `http_version TEXT`, `tentado_em DATETIME DEFAULT CURRENT_TIMESTAMP`. Detalhes adicionados em 0025/0026.

## Padrões
- Valores monetários sempre inteiros em centavos.
- Datas/timestamps em epoch ms (inteiros) quando em rotas e colunas de tempo; algumas migrations usam DATETIME default CURRENT_TIMESTAMP para IPs.
- IDs em TEXT (UUID ou chaves amigáveis como `root`).
- Tabela `logs` armazena auditoria e telemetria de UI: colunas `id`, `message`, `level` (`info|warn|error`), `context_json`, `created_at` (epoch ms).

## Exemplos JSON (baseados no schema)
```json
{
  "sales": [
    {"id": "uuid", "timestamp": 1700000000000, "operator_id": "root", "cash_session_id": "uuid", "subtotal": 1000, "discount_total": 0, "total": 1000, "status": "completed", "created_at": 1700000000000}
  ],
  "sale_items": [
    {"id": "uuid", "sale_id": "uuid", "product_id": "uuid", "product_name_snapshot": "Gelo 2kg", "product_internal_code_snapshot": "PROD014", "product_ean_snapshot": "789...", "unit_snapshot": "unit", "quantity": 1, "unit_price_at_sale": 599, "auto_discount_applied": 0, "manual_discount_applied": 0, "final_unit_price": 599, "line_total": 599}
  ],
  "payments": [
    {"id": "uuid", "sale_id": "uuid", "method": "pix", "amount": 599, "metadata_json": null, "created_at": 1700000000000}
  ]
}
```

## Migrations relevantes
- 0021_expand_units_add_serv: adiciona unidade `serv` a products e sale_items.
- 0022_rebuild_products_with_min_stock_and_serv: adiciona `min_stock`, `imageUrl`, `type`, mantém `serv`.
- 0023_products_allow_null_codes: permite `ean` e `internal_code` nulos; mantém `min_stock`.

## Lacunas
Esquemas completos de 0011, 0012, 0013, 0014, 0015, 0016, 0017, 0018, 0019, 0020 não estão no recorte; ver `docs/99-lacunas-perguntas.md`.
