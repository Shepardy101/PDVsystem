# 07 - Regras de Negócio

## Padrões gerais
- Valores monetários em centavos (inteiros) em DB e payloads.
- Timestamps em epoch ms em vendas, sessões, movimentos (quando armazenados como INTEGER).
- IDs TEXT/UUID.

## Vendas (POS)
- Finalização (`POST /api/pos/finalizeSale`): registra venda, itens, pagamentos vinculados à sessão de caixa informada.
- Listagem (`GET /api/pos/sales?cashSessionId=`): retorna vendas da sessão com itens e pagamentos.
- Métodos de pagamento permitidos: `cash | pix | card | other` (CHECK em payments).

## Caixa
- Abertura (`POST /api/cash/open`): requer `userId`; define `initial_balance`; cria `cash_sessions` com `is_open=1`.
- Consulta sessão aberta (`GET /api/cash/open?userId=`): 404 se inexistente.
- Movimentos manuais:
  - Suprimento (`POST /api/cash/suprimento`): entrada (`supply_in`), direction `in`.
  - Sangria (`POST /api/cash/sangria`): saída (`withdraw_out`), direction `out`.
  - Pagamento (`POST /api/cash/pagamento`): saída (`adjustment`), direction `out`.
- Movimentos por sessão (`GET /api/cash/movements/:cashSessionId` ou `/movements` para sessão aberta).
- Fechamento (`POST /api/cash/close`): recebe `physicalCount`; calcula diferença e encerra sessão.
- Histórico (`GET /api/cash/history`): consolida `sales_total`, `sangrias_total`, `suprimentos_total`, `expected_balance`; status danger se `difference_at_close != 0`.

## Estoque / Produtos
- `products.unit` suporta `cx|unit|kg|serv`; `min_stock` padrão 20; `status` active/inactive.
- `sale_items` capturam snapshot de produto (nome, códigos, unidade, preços, descontos aplicados).

## Segurança (negócio)
- Acesso condicionado a IP whitelist; IPs desconhecidos são registrados em pending_ips e bloqueados.
- Admin DB Manager restrito a localhost + flag `ENABLE_DB_ADMIN`.

## Auditoria e Logs
- `sessions-movements` retorna todas as sessões, movimentos e vendas com itens/pagamentos para BI/auditoria.

## Lacunas
- Validações detalhadas em repos `cash.repo.ts`, `pos.repo.ts`, `product.routes.ts` não exibidas; ver `docs/99-lacunas-perguntas.md`.
