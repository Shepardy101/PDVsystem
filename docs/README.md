# Documentação PDVsystem / NovaBev POS

## Índice
- [01 - Visão Geral](01-visao-geral.md)
- [02 - Stack e Dependências](02-stack-e-dependencias.md)
- [03 - Arquitetura](03-arquitetura.md)
- [04 - Estrutura de Pastas e Arquivos](04-estrutura-de-pastas-e-arquivos.md)
- [05 - Banco de Dados](05-banco-de-dados.md)
- [06 - API Express](06-api-express.md)
- [07 - Regras de Negócio](07-regras-de-negocio.md)
- [08 - Relatórios e BI](08-relatorios-e-bi.md)
- [09 - Instalação e Execução](09-instalacao-e-execucao.md)
- [10 - Automação Windows e pm2](10-automacao-windows-e-pm2.md)
- [11 - Segurança e Guardrails](11-seguranca-e-guardrails.md)
- [12 - Observabilidade e Monitoramento](12-observabilidade-monitoramento.md)
- [13 - Troubleshooting](13-troubleshooting.md)
- [14 - Glossário](14-glossario.md)
- [99 - Lacunas e Perguntas](99-lacunas-perguntas.md)

## Resumo Executivo
- PDVsystem é um POS para distribuidores de bebidas: frontend React/Vite (SPA) servido pelo backend Node/Express.
- Porta padrão 8787; controle de IP obrigatório via middleware `ipAccessControl` (exceções: health, admin-db, ip-control, uploads).
- Banco SQLite em `data/novabev.sqlite` com PRAGMAs WAL e foreign_keys; acesso via better-sqlite3.
- Módulos: PDV (vendas/pagamentos), Caixa (abertura/fechamento/movimentos), Produtos/Categorias, Entidades (usuários/clientes/fornecedores), Relatórios/BI, Configurações e DB Manager.
- Valores monetários são centavos; timestamps em epoch ms; IDs são TEXT/UUID.
- Admin DB Manager protegido por guard `guardAdminDb` e restrição a localhost + flag `ENABLE_DB_ADMIN`.
- Automação Windows com scripts `.bat` (instalar, iniciar, empacotar) e pm2.
- Frontend build em `dist/`; uploads em `public/uploads/`; backend build em `server/dist/`.
- Rotas principais em `/api/pos`, `/api/cash`, `/api/products`, `/api/categories`, `/api/users`, `/api/clients`, `/api/suppliers`, `/api/report`, `/api/reports`, `/api/admin-db`, `/api/admin/ip-control`, `/api/settings`.

## Fluxo UI → API → DB (texto)
- UI SPA chama `fetch` para `/api/*` (services em `services/` e chamadas diretas nas pages).
- Express aplica JSON, CORS, `ipAccessControl`, depois roteia para `server/src/routes/*`.
- Rotas chamam repositórios em `server/src/repositories/*`, que executam SQL via better-sqlite3 no SQLite.
- Respostas JSON alimentam tabelas, modais, dashboards e recibos no frontend.

## Como contribuir com a doc
- Atualize o arquivo de domínio afetado em `docs/` sempre que alterar rotas, migrations, serviços ou páginas.
- Rode `npm run docs:check` antes de commitar; o hook de pre-commit bloqueia se faltar arquivo ou referência.
- Mantenha links relativos entre arquivos e aponte caminhos reais do repositório.
