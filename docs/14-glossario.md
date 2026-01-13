# 14 - Glossário

- **Centavos**: representação monetária inteira (R$10,00 → 1000).
- **Epoch ms**: timestamp em milissegundos desde 1970-01-01.
- **cash_session**: sessão de caixa aberta/fechada que agrupa vendas e movimentos.
- **sale_items**: itens associados a uma venda; guardam snapshot do produto.
- **payments**: pagamentos de uma venda; métodos `cash|pix|card|other`.
- **allowed_ips / pending_ips**: tabelas de whitelist e fila de aprovação de IPs.
- **WAL**: Write-Ahead Logging do SQLite, habilitado via PRAGMA `journal_mode=WAL`.
- **guardAdminDb**: guard que habilita rotas admin-db apenas com flag e localhost.
