# 06 - API Express - Referência Completa

## Índice
- [Middlewares Globais](#middlewares-globais)
- [Health Check](#health-check)
- [POS - Ponto de Venda](#pos---ponto-de-venda)
- [Caixa](#caixa)
- [Produtos](#produtos)
- [Categorias](#categorias)
- [Usuários](#usuários)
- [Clientes](#clientes)
- [Fornecedores](#fornecedores)
- [Relatórios](#relatórios)
- [Configurações](#configurações)
- [Logs e Telemetria](#logs-e-telemetria)
- [Sistema (Métricas)](#sistema-métricas)
- [Admin DB Manager](#admin-db-manager)
- [Admin - Controle de IP](#admin---controle-de-ip)
- [Admin - Manutenção](#admin---manutenção)
- [Códigos de Erro](#códigos-de-erro)

---

## Middlewares Globais

Aplicados em `server/src/index.ts`:

1. **CORS** - Habilitado globalmente
2. **express.json()** - Parse de JSON
3. **ipAccessControl** - Whitelist de IPs (aplicado após exceções)

### Exceções de IP Control

Rotas que **NÃO** passam pelo controle de IP:
- `/api/health`
- `/api/admin-db`
- `/api/admin/ip-control`
- `/api/admin/maintenance`
- `/uploads`

---

## Health Check

### `GET /api/health`

Verifica status do servidor.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": 1706889600000
}
```

---

## POS - Ponto de Venda

Base: `/api/pos`

### `GET /api/pos/sales`

Lista vendas de uma sessão de caixa.

**Query Parameters:**
- `cashSessionId` (required) - ID da sessão de caixa

**Response 200:**
```json
[
  {
    "id": "uuid",
    "timestamp": 1706889600000,
    "operator_id": "root",
    "cash_session_id": "uuid",
    "subtotal": 1000,
    "discount_total": 0,
    "total": 1000,
    "status": "completed",
    "created_at": 1706889600000,
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name_snapshot": "Produto X",
        "quantity": 2,
        "unit_price_at_sale": 500,
        "final_unit_price": 500,
        "line_total": 1000
      }
    ],
    "payments": [
      {
        "id": "uuid",
        "method": "pix",
        "amount": 1000,
        "created_at": 1706889600000
      }
    ]
  }
]
```

**Errors:**
- `400` - cashSessionId ausente
- `500` - Erro interno

### `POST /api/pos/finalizeSale`

Finaliza uma venda.

**Request Body:**
```json
{
  "operatorId": "root",
  "cashSessionId": "uuid",
  "subtotal": 1000,
  "discountTotal": 0,
  "total": 1000,
  "items": [
    {
      "productId": "uuid",
      "productName": "Produto X",
      "productInternalCode": "PROD001",
      "productEan": "7891234567890",
      "unit": "unit",
      "quantity": 2,
      "unitPrice": 500,
      "autoDiscount": 0,
      "manualDiscount": 0,
      "finalUnitPrice": 500,
      "lineTotal": 1000
    }
  ],
  "payments": [
    {
      "method": "pix",
      "amount": 1000
    }
  ],
  "clientId": "uuid" // opcional
}
```

**Response 201:**
```json
{
  "saleId": "uuid"
}
```

**Errors:**
- `400` - Validação falhou (SALE_ERROR)
- `500` - Erro interno

---

## Caixa

Base: `/api/cash`

### `GET /api/cash/open`

Retorna sessão de caixa aberta do usuário.

**Query Parameters:**
- `userId` (required)

**Response 200:**
```json
{
  "id": "uuid",
  "operator_id": "root",
  "opened_at": 1706889600000,
  "closed_at": null,
  "initial_balance": 10000,
  "is_open": 1,
  "created_at": 1706889600000,
  "updated_at": 1706889600000
}
```

**Errors:**
- `404` - Nenhuma sessão aberta

### `POST /api/cash/open`

Abre uma nova sessão de caixa.

**Request Body:**
```json
{
  "operatorId": "root",
  "initialBalance": 10000,
  "userId": "root"
}
```

**Response 201:**
```json
{
  "sessionId": "uuid"
}
```

### `POST /api/cash/close`

Fecha uma sessão de caixa.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "physicalCount": 15000
}
```

**Response 200:**
```json
{
  "success": true,
  "difference": 500
}
```

### `GET /api/cash/movements/:cashSessionId`

Lista movimentos de uma sessão.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "cash_session_id": "uuid",
    "type": "supply_in",
    "direction": "in",
    "amount": 5000,
    "description": "Suprimento inicial",
    "timestamp": 1706889600000,
    "category": "Suprimento",
    "operator": "Admin"
  }
]
```

### `GET /api/cash/movements`

Lista movimentos da sessão aberta.

**Query Parameters:**
- `operatorId` (required)

### `POST /api/cash/suprimento`

Registra entrada de dinheiro (suprimento).

**Request Body:**
```json
{
  "amount": 5000,
  "category": "Suprimento",
  "description": "Troco adicional",
  "operatorId": "root",
  "cashSessionId": "uuid" // opcional, usa sessão aberta se omitido
}
```

**Response 201:**
```json
{
  "movementId": "uuid"
}
```

### `POST /api/cash/sangria`

Registra saída de dinheiro (sangria).

**Request Body:**
```json
{
  "amount": 10000,
  "category": "Sangria",
  "description": "Retirada para banco",
  "operatorId": "root",
  "cashSessionId": "uuid" // opcional
}
```

**Response 201:**
```json
{
  "movementId": "uuid"
}
```

### `POST /api/cash/pagamento`

Registra pagamento/despesa.

**Request Body:**
```json
{
  "amount": 2000,
  "category": "Despesa",
  "description": "Conta de luz",
  "operatorId": "root",
  "cashSessionId": "uuid" // opcional
}
```

**Response 201:**
```json
{
  "movementId": "uuid"
}
```

### `GET /api/cash/sessions-movements`

Retorna todas as sessões, movimentos e vendas para análise.

**Response 200:**
```json
{
  "sessions": [...],
  "movements": [...],
  "sales": [
    {
      "...": "...",
      "payments": [...],
      "items": [...]
    }
  ]
}
```

### `GET /api/cash/history`

Lista histórico de sessões com totalizações.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "operator_id": "root",
    "opened_at": 1706889600000,
    "closed_at": 1706900000000,
    "initial_balance": 10000,
    "is_open": 0,
    "physical_count_at_close": 25000,
    "difference_at_close": 0,
    "sales_total": 15000,
    "sangrias_total": 0,
    "suprimentos_total": 0,
    "expected_balance": 25000,
    "status": "success" // ou "danger" se difference != 0
  }
]
```

---

## Produtos

Base: `/api/products`

### `GET /api/products`

Lista produtos com paginação.

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Cerveja Skol 350ml",
      "ean": "7891234567890",
      "internal_code": "PROD001",
      "unit": "unit",
      "cost_price": 250,
      "sale_price": 500,
      "auto_discount_enabled": 0,
      "auto_discount_value": 0,
      "category_id": "uuid",
      "supplier_id": "uuid",
      "status": "active",
      "stock_on_hand": 100,
      "imageUrl": "/uploads/image.jpg",
      "type": "product",
      "min_stock": 20,
      "created_at": 1706889600000,
      "updated_at": 1706889600000
    }
  ],
  "total": 150
}
```

### `GET /api/products/search`

Busca produtos por nome, EAN ou código interno.

**Query Parameters:**
- `q` (required) - Termo de busca

**Response 200:**
```json
{
  "items": [...]
}
```

### `GET /api/products/:id`

Busca produto por ID.

**Response 200:**
```json
{
  "id": "uuid",
  "name": "...",
  "...": "..."
}
```

**Errors:**
- `404` - Produto não encontrado

### `POST /api/products`

Cria novo produto ou serviço.

**Request Body (Produto):**
```json
{
  "name": "Cerveja Skol 350ml",
  "ean": "7891234567890",
  "internal_code": "PROD001",
  "unit": "unit",
  "cost_price": 250,
  "sale_price": 500,
  "auto_discount_enabled": 0,
  "auto_discount_value": 0,
  "category_id": "uuid",
  "supplier_id": "uuid",
  "status": "active",
  "stock_on_hand": 100,
  "type": "product",
  "min_stock": 20,
  "imageUrl": ""
}
```

**Request Body (Serviço):**
```json
{
  "name": "Entrega Express",
  "ean": "",
  "internal_code": "",
  "unit": "serv",
  "cost_price": 0,
  "sale_price": 1000,
  "type": "service",
  "status": "active"
}
```

**Response 201:**
```json
{
  "product": {...}
}
```

**Errors:**
- `400` - VALIDATION_ERROR
- `409` - DUPLICATE_EAN ou DUPLICATE_INTERNAL_CODE

### `PUT /api/products/:id`

Atualiza produto existente.

**Request Body:** (mesma estrutura do POST)

**Response 200:**
```json
{
  "product": {...}
}
```

**Errors:**
- `404` - NOT_FOUND
- `400` - VALIDATION_ERROR
- `409` - DUPLICATE_EAN ou DUPLICATE_INTERNAL_CODE

### `DELETE /api/products/:id`

Deleta produto individual.

**Response:** `204 No Content`

**Errors:**
- `400` - SQLITE_CONSTRAINT_FOREIGNKEY (produto usado em vendas)

### `DELETE /api/products`

Deleta TODOS os produtos (use com cuidado!).

**Response:** `204 No Content`

### `POST /api/products/upload-image`

Upload de imagem de produto.

**Request:** `multipart/form-data`
- `image` (file)
- `ean` (string)
- `description` (string)

**Response 200:**
```json
{
  "imageUrl": "/uploads/filename.jpg"
}
```

### `POST /api/products/delete-image`

Remove imagem de produto.

**Request Body:**
```json
{
  "imageUrl": "/uploads/filename.jpg",
  "productId": "uuid"
}
```

**Response 200:**
```json
{
  "success": true
}
```

### `GET /api/products/events` (SSE)

Server-Sent Events para atualizações em tempo real de produtos.

**Events:**
- `created` - Produto criado
- `updated` - Produto atualizado
- `deleted` - Produto deletado

---

## Categorias

Base: `/api/categories`

### `GET /api/categories`

Lista todas as categorias.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Cervejas",
    "created_at": 1706889600000,
    "updated_at": 1706889600000
  }
]
```

### `POST /api/categories`

Cria nova categoria.

**Request Body:**
```json
{
  "name": "Refrigerantes"
}
```

**Response 201:**
```json
{
  "category": {...}
}
```

### `PUT /api/categories/:id`

Atualiza categoria.

**Request Body:**
```json
{
  "name": "Refrigerantes e Sucos"
}
```

**Response 200:**
```json
{
  "category": {...}
}
```

### `DELETE /api/categories/:id`

Deleta categoria.

**Response:** `204 No Content`

---

## Usuários

Base: `/api/users`

### `GET /api/users`

Lista todos os usuários.

**Response 200:**
```json
[
  {
    "id": "root",
    "name": "Administrador",
    "email": "root@root.com",
    "role": "admin",
    "status": "active",
    "lastLogin": 1706889600000
  }
]
```

### `POST /api/users`

Cria novo usuário.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "operator",
  "status": "active"
}
```

**Roles disponíveis:**
- `admin` - Acesso total
- `manager` - Gestão e relatórios
- `operator` - Apenas operação de caixa/PDV

**Response 201:**
```json
{
  "user": {...}
}
```

### `POST /api/users/login`

Autentica usuário.

**Request Body:**
```json
{
  "email": "root@root.com",
  "password": "root"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "root",
    "name": "Administrador",
    "email": "root@root.com",
    "role": "admin",
    "status": "active"
  }
}
```

**Errors:**
- `401` - Credenciais inválidas
- `403` - Usuário bloqueado

### `PUT /api/users/:id`

Atualiza usuário.

**Response 200:**
```json
{
  "user": {...}
}
```

### `DELETE /api/users/:id`

Deleta usuário.

**Response:** `204 No Content`

---

## Clientes

Base: `/api/clients`

### `GET /api/clients`

Lista todos os clientes.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Bar do João",
    "email": "bar@example.com",
    "phone": "(11) 98765-4321",
    "address": "Rua X, 123",
    "created_at": 1706889600000,
    "updated_at": 1706889600000
  }
]
```

### `POST /api/clients`

Cria novo cliente.

**Request Body:**
```json
{
  "name": "Bar do João",
  "email": "bar@example.com",
  "phone": "(11) 98765-4321",
  "address": "Rua X, 123"
}
```

**Response 201:**
```json
{
  "client": {...}
}
```

### `PUT /api/clients/:id`

Atualiza cliente.

**Response 200:**
```json
{
  "client": {...}
}
```

### `DELETE /api/clients/:id`

Deleta cliente.

**Response:** `204 No Content`

---

## Fornecedores

Base: `/api/suppliers`

### `GET /api/suppliers`

Lista todos os fornecedores.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Ambev",
    "fantasy": "Ambev Distribuidora",
    "cnpj": "12345678000190",
    "address": "Av. Principal, 1000",
    "phone": "(11) 3000-0000",
    "email": "contato@ambev.com",
    "category": "Bebidas",
    "created_at": 1706889600000,
    "updated_at": 1706889600000
  }
]
```

### `GET /api/suppliers/:id`

Busca fornecedor por ID.

**Response 200:**
```json
{
  "id": "uuid",
  "...": "..."
}
```

### `POST /api/suppliers`

Cria novo fornecedor.

**Request Body:**
```json
{
  "name": "Ambev",
  "fantasy": "Ambev Distribuidora",
  "cnpj": "12345678000190",
  "address": "Av. Principal, 1000",
  "phone": "(11) 3000-0000",
  "email": "contato@ambev.com",
  "category": "Bebidas"
}
```

**Response 201:**
```json
{
  "supplier": {...}
}
```

### `PUT /api/suppliers/:id`

Atualiza fornecedor.

**Response 200:**
```json
{
  "supplier": {...}
}
```

### `DELETE /api/suppliers/:id`

Deleta fornecedor.

**Response:** `204 No Content`

---

## Relatórios

### Sold Products

#### `GET /api/report/sold-products`

Produtos vendidos agregados.

**Query Parameters:**
- `start` (optional) - Timestamp início (epoch ms)
- `end` (optional) - Timestamp fim (epoch ms)

**Response 200:**
```json
[
  {
    "product_id": "uuid",
    "product_name": "Cerveja Skol 350ml",
    "total_quantity": 150,
    "total_value": 75000
  }
]
```

#### `GET /api/report/sold-products-detailed`

Lista detalhada de itens vendidos.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "sale_id": "uuid",
    "product_id": "uuid",
    "product_name_snapshot": "Cerveja Skol 350ml",
    "quantity": 2,
    "unit_price_at_sale": 500,
    "line_total": 1000,
    "sale_date": 1706889600000
  }
]
```

### Product Mix

#### `GET /api/reports/product-mix`

Análise de mix de produtos.

**Query Parameters:**
- `from` (required) - Timestamp início (epoch ms)
- `to` (required) - Timestamp fim (epoch ms)

**Response 200:**
```json
[
  {
    "product_id": "uuid",
    "product_name": "Cerveja Skol 350ml",
    "frequency": 45,
    "total_quantity": 150,
    "total_value": 75000,
    "cost_price": 250,
    "sale_price": 500,
    "unit": "unit"
  }
]
```

**Campos:**
- `frequency` - Número de vendas distintas
- `total_quantity` - Soma de quantidades vendidas
- `total_value` - Soma do valor total

---

## Configurações

Base: `/api/settings`

### `GET /api/settings`

Lista todas as configurações.

**Response 200:**
```json
[
  {
    "key": "admin_password",
    "value": "hashed_password"
  },
  {
    "key": "can_approve_movements",
    "value": "true"
  },
  {
    "key": "Enable_Negative_Casher",
    "value": "false"
  }
]
```

### `GET /api/settings/:key`

Busca configuração específica.

**Response 200:**
```json
{
  "key": "can_approve_movements",
  "value": "true"
}
```

**Errors:**
- `404` - Chave não encontrada

### `PUT /api/settings/:key`

Atualiza configuração.

**Request Body:**
```json
{
  "value": "new_value",
  "oldValue": "old_value" // obrigatório para admin_password
}
```

**Response 200:**
```json
{
  "key": "can_approve_movements",
  "value": "false"
}
```

**Validação especial para `admin_password`:**
- Requer `oldValue` no body
- Valida senha antiga antes de atualizar

---

## Logs e Telemetria

### Logs

#### `GET /api/logs`

Busca logs do sistema.

**Query Parameters:**
- `limit` (optional)
- `level` (optional) - info, warn, error
- `search` (optional)

**Response 200:**
```json
[
  {
    "id": 1,
    "message": "Produto criado",
    "level": "info",
    "context_json": "{\"productId\":\"uuid\"}",
    "created_at": 1706889600000
  }
]
```

### Telemetria

#### `POST /api/telemetry/track`

Registra evento de telemetria do frontend.

**Request Body:**
```json
{
  "userId": "root",
  "page": "POS",
  "area": "vendas",
  "action": "finalizacao",
  "meta": {
    "total": 1000,
    "items": 3
  },
  "ts": 1706889600000
}
```

**Response 200:**
```json
{
  "ok": true
}
```

**Errors:**
- `400` - Faltando page, area ou action

---

## Sistema (Métricas)

Base: `/api/sys`

### `GET /api/sys/cpu`

Métricas de CPU.

**Response 200:**
```json
{
  "usage": 25.5,
  "cores": 8,
  "loadAvg": [1.5, 1.2, 1.0]
}
```

### `GET /api/sys/mem`

Métricas de memória.

**Response 200:**
```json
{
  "used": 4.2,
  "total": 16.0,
  "usagePercent": 26.25
}
```

---

## Admin DB Manager

Base: `/api/admin-db`

> [!CAUTION]
> **Proteção:** Requer `ENABLE_DB_ADMIN=true` no `.env` E acesso via localhost.
> **NUNCA habilite em produção pública!**

### `GET /api/admin-db/tables`

Lista todas as tabelas do banco.

**Response 200:**
```json
[
  "sales",
  "products",
  "users",
  "..."
]
```

### `GET /api/admin-db/schema`

Schema de uma tabela.

**Query Parameters:**
- `table` (required)

**Response 200:**
```json
{
  "columns": [
    {
      "cid": 0,
      "name": "id",
      "type": "TEXT",
      "notnull": 1,
      "dflt_value": null,
      "pk": 1
    }
  ],
  "foreignKeys": [...]
}
```

### `GET /api/admin-db/rows`

Lista registros de uma tabela.

**Query Parameters:**
- `table` (required)
- `limit` (optional, default: 100)
- `offset` (optional, default: 0)
- `orderBy` (optional)
- `orderDir` (optional, asc/desc)
- `search` (optional)

**Response 200:**
```json
{
  "rows": [...],
  "total": 150
}
```

### `POST /api/admin-db/rows`

Insere registro.

**Request Body:**
```json
{
  "table": "products",
  "data": {
    "id": "uuid",
    "name": "Produto X",
    "...": "..."
  }
}
```

**Response 201:**
```json
{
  "success": true
}
```

### `PUT /api/admin-db/rows`

Atualiza registro.

**Request Body:**
```json
{
  "table": "products",
  "pk": "id",
  "pkValue": "uuid",
  "data": {
    "name": "Produto Y"
  }
}
```

**Response 200:**
```json
{
  "success": true
}
```

### `DELETE /api/admin-db/rows`

Deleta registro.

**Request Body:**
```json
{
  "table": "products",
  "pk": "id",
  "pkValue": "uuid"
}
```

**Response 200:**
```json
{
  "success": true
}
```

### `POST /api/admin-db/query`

Query builder seguro.

**Request Body:**
```json
{
  "table": "products",
  "filters": [
    {
      "column": "status",
      "operator": "=",
      "value": "active"
    }
  ],
  "orderBy": "name",
  "orderDir": "asc",
  "limit": 50
}
```

**Operators permitidos:** `=`, `!=`, `>`, `<`, `>=`, `<=`, `LIKE`

**Response 200:**
```json
{
  "rows": [...]
}
```

### `POST /api/admin-db/reset`

Reset completo do banco de dados.

**Request Body:**
```json
{
  "confirm": "RESET"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Database reset successful"
}
```

> [!WARNING]
> **ATENÇÃO:** Esta operação:
> - Limpa TODAS as tabelas (exceto settings e schema_version)
> - Recria usuário root (senha: "root")
> - É IRREVERSÍVEL!

### `POST /api/admin-db/seed-demo`

Popula banco com dados de demonstração.

**Response 200:**
```json
{
  "success": true,
  "message": "Demo data seeded"
}
```

---

## Admin - Controle de IP

Base: `/api/admin/ip-control`

> [!NOTE]
> Estas rotas NÃO passam pelo middleware de IP control.

### `GET /api/admin/ip-control/blocked`

Lista IPs bloqueados (deprecated - use pending).

### `GET /api/admin/ip-control/pending`

Lista IPs pendentes de aprovação.

**Response 200:**
```json
[
  {
    "id": 1,
    "ip": "192.168.1.100",
    "hostname": "desktop-abc",
    "user_agent": "Mozilla/5.0...",
    "requested_path": "/api/products",
    "request_method": "GET",
    "referer": "http://localhost:8787/",
    "accept_language": "pt-BR,pt;q=0.9",
    "accept_header": "application/json",
    "accept_encoding": "gzip, deflate",
    "forwarded_for_raw": null,
    "remote_port": 54321,
    "http_version": "1.1",
    "tentado_em": "2026-02-02 15:30:00"
  }
]
```

### `GET /api/admin/ip-control/allowed`

Lista whitelist de IPs autorizados.

**Response 200:**
```json
[
  {
    "id": 1,
    "ip": "192.168.1.50",
    "hostname": "laptop-xyz",
    "autorizado_em": "2026-02-01 10:00:00",
    "autorizado_por": "admin"
  }
]
```

### `POST /api/admin/ip-control/allow`

Autoriza um IP.

**Request Body:**
```json
{
  "ip": "192.168.1.100",
  "hostname": "desktop-abc",
  "autorizado_por": "admin"
}
```

**Response 200:**
```json
{
  "success": true
}
```

### `POST /api/admin/ip-control/deny`

Nega/remove IP da fila de pendentes.

**Request Body:**
```json
{
  "ip": "192.168.1.100"
}
```

**Response 200:**
```json
{
  "success": true
}
```

### `POST /api/admin/ip-control/remove`

Remove IP da whitelist.

**Request Body:**
```json
{
  "ip": "192.168.1.50"
}
```

**Response 200:**
```json
{
  "success": true
}
```

---

## Admin - Manutenção

Base: `/api/admin/maintenance`

> [!CAUTION]
> **Proteção:** Mesma do Admin DB (ENABLE_DB_ADMIN + localhost)

### `POST /api/admin/maintenance/purge-cache`

Limpa logs e IPs pendentes.

**Response 200:**
```json
{
  "success": true,
  "logsDeleted": 1523,
  "pendingIpsDeleted": 5
}
```

**Ações:**
- Deleta todos os registros de `logs`
- Deleta todos os registros de `pending_ips`
- Registra auditoria da ação

### `POST /api/admin/maintenance/wipe-local`

Reset completo do sistema (mantém settings).

**Response 200:**
```json
{
  "success": true,
  "message": "Local data wiped, root user recreated"
}
```

**Ações:**
- Desliga foreign keys temporariamente
- Limpa TODAS as tabelas (exceto settings e schema_version)
- Reseta sequences
- Recria usuário root (senha: "root")
- Reativa foreign keys
- Registra auditoria

> [!DANGER]
> **EXTREMAMENTE PERIGOSO!** Use apenas para reset completo em ambiente de desenvolvimento/teste.

---

## Códigos de Erro

### Códigos Comuns

| Código | Status | Descrição |
|--------|--------|-----------|
| `VALIDATION_ERROR` | 400 | Dados inválidos |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `DUPLICATE_EAN` | 409 | EAN já existe |
| `DUPLICATE_INTERNAL_CODE` | 409 | Código interno já existe |
| `SQLITE_CONSTRAINT_FOREIGNKEY` | 400 | Violação de chave estrangeira |
| `SALE_ERROR` | 400 | Erro ao finalizar venda |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |

### Formato de Erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descrição do erro"
  }
}
```

### Erro de IP Bloqueado (403)

**HTML** (quando Accept: text/html):
```html
<html>
  <body>
    <h1>403 - Acesso Negado</h1>
    <p>Seu IP não está autorizado.</p>
    <p>IP detectado: 192.168.1.100</p>
  </body>
</html>
```

**JSON** (quando Accept: application/json):
```json
{
  "error": "IP não autorizado",
  "yourIp": "192.168.1.100"
}
```

---

## Referências Rápidas

### Arquivos Fonte

- Middleware IP: `server/src/middleware/ipAccessControl.ts`
- Rotas: `server/src/routes/*.ts`
- Repositórios: `server/src/repositories/*.ts`
- Services: `server/src/services/*.ts`

### Documentos Relacionados

- [Banco de Dados](05-banco-de-dados.md) - Schema e migrations
- [Regras de Negócio](07-regras-de-negocio.md) - Validações e lógica
- [Segurança](11-seguranca-e-guardrails.md) - Controles de acesso
- [Troubleshooting](13-troubleshooting.md) - Resolução de problemas

---

<div align="center">

**Documentação completa da API PDVsystem**

Última atualização: Fevereiro 2026 | Versão: 1.0.26

</div>
