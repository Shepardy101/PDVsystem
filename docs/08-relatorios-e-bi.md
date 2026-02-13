# 08 - Relatórios e BI

## Endpoints
- `GET /api/report/sold-products?start=&end=` (opcional): agrega `sale_items` por produto, soma `quantity` e `line_total`..
- `GET /api/report/sold-products-detailed`: lista itens de venda com `sale_date` (timestamp), quantidade e valor.
- `GET /api/reports/product-mix?from=&to=`: requer intervalo epoch ms; calcula mix por produto em `reports.repo`). 
- `GET /api/cash/sessions-movements`: fornece datasets de sessões, movimentos e vendas com itens/pagamentos para análises.

## Campos e cálculos (product-mix)
- `frequency`: número de vendas distintas por produto.
- `total_quantity`: soma de `sale_items.quantity` por produto.
- `total_value`: soma de `sale_items.line_total` por produto.
- `cost_price`, `sale_price`: trazidos de `products` (fallback para 0).
- `unit`: de `products.unit` ou `sale_items.unit_snapshot`.

## Parâmetros de período
- `start`, `end`, `from`, `to` são epoch ms.

## UI
- `pages/Reports.tsx`: consome `/api/report` e `/api/reports`, exibe JSON retornado.


