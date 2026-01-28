PDVsystem  é um ponto de venda para distribuidores de bebidas: frontend React/Vite (SPA) servido pelo backend Node/Express na porta 8787, com banco SQLite único em `data/novabev.sqlite` e controle de acesso por whitelist de IP.

## Visão rápida
- Módulos: PDV (vendas/pagamentos), Caixa (sessões e movimentos), Produtos/Categorias, Entidades (usuários/clientes/fornecedores), Relatórios/BI, Settings, Admin DB/Manutenção.
- Dados: valores monetários em centavos, timestamps em epoch ms, IDs TEXT/UUID, unidade de produto inclui `serv`.
- Segurança: middleware `ipAccessControl` (whitelist; exceções health/admin-db/ip-control/uploads); Admin DB apenas com `ENABLE_DB_ADMIN=true` e localhost.
- Auditoria: logs em `/api/logs`; limpeza rápida via `/api/admin/maintenance/purge-cache`; wipe controlado via `/api/admin/maintenance/wipe-local` (limpa dados, recria root).

## Stack
- Backend: Node.js (v24 recomendado) + Express + better-sqlite3.
- Frontend: React 19 + Vite + Tailwind CSS (via components UI).
- Service: pm2 para gestão de processos e resiliência no Windows.
- Banco: SQLite (better-sqlite3) em `data/novabev.sqlite`
- Automação: scripts `.bat` + pm2 (Windows)

## 🚀 Como Iniciar

### 🛠️ Configuração Inicial (.env)
Certifique-se de configurar o arquivo `.env` na raiz:
```env
VITE_APP_NAME="Nome do Seu Sistema"
ENABLE_DB_ADMIN=true
VITE_LOGS_WEBHOOK_URL=https://...
```

### 📦 Distribuição para Cliente
Para gerar um pacote pronto para o cliente final:
1. `npm run build`
2. `.\package-app.bat` -> Gera `build/PDVsystem-release.zip`

### 💻 No Cliente
1. Extraia o ZIP.
2. Execute `.\instalar-app.bat`.
3. Para abrir o sistema, use o atalho criado ou `.\iniciar-app.bat`.

## Executar (resumo)
- Dev: `npm run dev` (backend watch + Vite em 3000)
- Build: `npm run build` (client + server)
- Prod local: `npm run start:prod` ou `pm2 start server/dist/index.js --name PDVsystem --env production`
- Pacote para cliente: `package-app.bat` → gera `build/PDVsystem-release.zip`
- Instalação no cliente (após extrair o zip): `instalar-app.bat` (npm ci --production, pm2) e depois `iniciar-app.bat`

 $env:ENABLE_DB_ADMIN="true"; npm run dev

$env:ENABLE_DB_ADMIN="true"; npm run start:prod

## Pastas importantes
- `dist/` SPA frontend
- `server/dist/` backend compilado
- `data/novabev.sqlite` banco de dados (WAL/SHM gerados em runtime)
- `public/uploads/` arquivos enviados
- `server/src/db/migrations/` referências SQL (não executar em produção já provisionada)

## Documentação
- Índice geral: [docs/README.md](docs/README.md)
- Visão geral: [docs/01-visao-geral.md](docs/01-visao-geral.md)
- Arquitetura e pastas: [docs/03-arquitetura.md](docs/03-arquitetura.md), [docs/04-estrutura-de-pastas-e-arquivos.md](docs/04-estrutura-de-pastas-e-arquivos.md)
- Banco de dados: [docs/05-banco-de-dados.md](docs/05-banco-de-dados.md)
- API Express: [docs/06-api-express.md](docs/06-api-express.md)
- Instalação/execução e automação: [docs/09-instalacao-e-execucao.md](docs/09-instalacao-e-execucao.md), [docs/10-automacao-windows-e-pm2.md](docs/10-automacao-windows-e-pm2.md)
- Segurança: [docs/11-seguranca-e-guardrails.md](docs/11-seguranca-e-guardrails.md)

## Segurança rápida
- Mantenha `ENABLE_DB_ADMIN=false` em produção e acesso apenas localhost quando habilitar.
- Configure whitelist de IPs antes de abrir para rede.
- Use o banco já provisionado (não rodar migrations se não for necessário). Faça backup de `data/novabev.sqlite` e `public/uploads/`.

## Suporte
Para dúvidas ou lacunas, consulte [docs/99-lacunas-perguntas.md](docs/99-lacunas-perguntas.md).
