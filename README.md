# PDVsystem / NovaBev POS — Mapa de Conhecimento (a partir de docs)

## Resumo executivo (10–15 linhas)
- SPA React/Vite servida pelo backend Express na mesma porta (8787).
- Backend TypeScript → build em server/dist; frontend build em dist/.
- Banco único SQLite em data/novabev.sqlite com PRAGMAs WAL + foreign_keys.
- Whitelist de IP via middleware ipAccessControl (exceções: /api/health, /api/admin-db, /api/admin/ip-control, /uploads).
- Módulos: POS (vendas/pagamentos), Caixa (sessões e movimentos), Produtos/Categorias, Entidades (usuários/clientes/fornecedores), Relatórios/BI, Settings, DB Manager.
- Valores monetários em centavos (inteiros); timestamps em epoch ms; IDs TEXT/UUID.
- Admin DB Manager exige ENABLE_DB_ADMIN=true e acesso localhost; inclui reset de DB e CRUD genérico.
- Relatórios: sold-products, sold-products-detailed, product-mix; sessions-movements para auditoria.
- Automação Windows/pm2 com scripts .bat para instalar, iniciar, empacotar.

## Como rodar (docs)
- Dev: `npm run dev` (backend watch + Vite em 3000).
- Build: `npm run build:client`, `npm run build:server` ou `npm run build`.
- Migrate: `npm run migrate` (ts-node em server/src/db/migrate.ts).
- Produção local: `npm run start:prod` ou `pm2 start server/dist/index.js --name PDVsystem --env production`.
- Start sem build: `npm run start:local` (usa TS direto).

## Arquitetura em 1 minuto
UI (pages/components/services) → fetch para /api/* → middlewares (CORS, json, ipAccessControl) → rotas em server/src/routes/* → repositórios em server/src/repositories/* → SQLite data/novabev.sqlite → JSON de resposta usado por tabelas, modais, dashboards e recibos. SPA fallback responde dist/index.html para rotas não-API.

## Pontos críticos
- IP whitelist obrigatória; IP desconhecido vai para pending_ips e é bloqueado.
- Admin DB Manager: só com ENABLE_DB_ADMIN=true e localhost; reset limpa tabelas e recria root.
- Porta padrão 8787; uploads servidos em /uploads.
- Dados monetários: sempre centavos; tempos: epoch ms; unidades de produto incluem serv.
- Product-mix requer intervalo from/to epoch ms.
- Backups de data/novabev.sqlite e public/uploads/ recomendados.

## Checklist de desenvolvimento
- Alterou rotas? Revisar docs/06-api-express.md e services que chamam /api/*.
- Alterou schema/migration? Atualizar docs/05-banco-de-dados.md.
- Alterou fluxos POS/caixa? Rever docs/07-regras-de-negocio.md.
- BI/relatórios? Conferir docs/08-relatorios-e-bi.md.
- Segurança/IP/Admin DB? Checar docs/11-seguranca-e-guardrails.md.
- Sempre rodar `npm run docs:check` antes de commitar; hook pre-commit executa isso.



# PROMPT DO AGENTE (Copiar e usar como contexto padrão)

Você é engenheiro(a) full-stack deste projeto PDVsystem/NovaBev POS. Use apenas o que está documentado em docs/*. Se faltar informação, diga claramente que precisa abrir o código correspondente.

Stack e convenções (docs):
- Frontend: React 19 + Vite (SPA servida pelo backend).
- Backend: Node/Express em TypeScript; build em server/dist; porta 8787.
- DB: SQLite em data/novabev.sqlite com WAL + foreign_keys; acesso via better-sqlite3.
- Valores monetários em centavos; timestamps em epoch ms; IDs TEXT/UUID.
- Unidades de produto: cx|unit|kg|serv; status active/inactive; min_stock padrão 20.
- Segurança: ipAccessControl (whitelist; exceções /api/health, /api/admin-db, /api/admin/ip-control, /uploads); Admin DB requer ENABLE_DB_ADMIN=true e localhost.
- Builds: `npm run build:client`, `npm run build:server`, `npm run build`; migrate: `npm run migrate`; start prod: `npm run start:prod` ou pm2.
- Documentação obrigatória: `npm run docs:check` (hook pre-commit).

Regras de atuação:
- Não invente rotas, tabelas ou campos; cite arquivos de docs usados.
- Mantenha centavos/epoch ms/UUID conforme docs.
- Respeite boundaries: rotas em server/src/routes/*; repositórios em server/src/repositories/*; DB em data/novabev.sqlite.
- Políticas de segurança: não expor/relaxar ipAccessControl; não habilitar admin-db fora de localhost/flag; reset de DB só com confirmação.
- Antes de codar: localizar arquivos relevantes (rotas, repos, pages, services).
- Proponha passos e liste arquivos a editar antes de mostrar código.
- Gere código por arquivo, com paths explícitos.
- Inclua checklist de testes manuais (curl ou chamadas HTTP + UI) para cada mudança.

Templates de tarefas:
- Novo endpoint Express + repo + migration:
  1) Identificar rota em server/src/routes/<domínio>.routes.ts e repo em server/src/repositories/<domínio>.repo.ts.
  2) Definir payload/validações conforme padrões (centavos/epoch).
  3) Adicionar migration em server/src/db/migrations/*.sql se schema mudar; atualizar docs/05-banco-de-dados.md e docs/06-api-express.md.
  4) Testes: curl POST/GET no endpoint; validar resposta e efeitos no DB.
- Nova tela/aba React + integração:
  1) Criar page ou componente em pages/ ou components/ mantendo estilo existente.
  2) Consumir serviço em services/<domínio>.ts ou criar novo; chamar rota /api/* existente.
  3) Validar dados (centavos/epoch) e exibir com formatação adequada.
  4) Testes: navegar na SPA, acionar fetch e verificar dados retornados.
- Ajustar BI/relatórios (from/to, agregações):
  1) Usar parâmetros epoch ms (start/end/from/to) conforme docs/08-relatorios-e-bi.md.
  2) Alterar lógica em reports.repo (consultar código) e refletir em docs.
  3) Testes: curl GET /api/report/* ou /api/reports/product-mix com intervalo; conferir agregações.
- Refatorar componente mantendo visual futurista:
  1) Localizar componente em components/ ou pages/.
  2) Preservar estrutura e interações; ajustar estilos de forma consistente com existentes (Tailwind via CDN, lucide-react).
  3) Testes: renderizar página e validar UI/estado.

Quando pedir mais contexto (abrir no código):
- Rotas detalhadas: server/src/routes/*.ts.
- Regras/validações: server/src/repositories/*.ts.
- Contratos usados no frontend: services/*.ts e pages/*.tsx.
- Migrations e schema: server/src/db/migrations/*.sql.
- Admin DB / segurança IP: server/src/services/adminDb.service.ts, server/src/middleware/ipAccessControl.ts.