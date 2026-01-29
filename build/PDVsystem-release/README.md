PDVsystem é um ponto de venda para distribuidores de bebidas: frontend React/Vite (SPA) servido pelo backend Node/Express na porta 8787, com banco SQLite único em `data/novabev.sqlite` e controle de acesso por whitelist de IP.

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



## 🖥️ Executar backend em background (Produção)

Para rodar o backend automaticamente em background (sem terminal aberto), utilize o pm2:

### Instalar pm2 (se necessário)
Abra o Prompt de Comando como Administrador e execute:
```sh
npm install -g pm2
```

### Iniciar backend com pm2
No diretório do release, execute:
```sh
pm2 start server/dist/index.js --name PDVsystem --env production --node-args="--env-file=.env"
pm2 save
pm2 startup
```
Esses comandos garantem que o backend rode em segundo plano e inicie automaticamente com o Windows.

### Parar, reiniciar e logs
```sh
pm2 stop PDVsystem      # Para o backend
pm2 restart PDVsystem   # Reinicia o backend
pm2 logs PDVsystem      # Mostra logs
```

### Remover do pm2
```sh
pm2 delete PDVsystem
```

---
## Executar (resumo)
- Dev: `npm run dev` (backend watch + Vite em 3000)
- Build: `npm run build` (client + server)
- Prod local: `npm run start:prod`
- Pacote para cliente: `package-app.bat` → gera `build/PDVsystem-release.zip`
- Instalação no cliente (após extrair o zip): `instalar-app.bat` (npm ci --production) e depois `iniciar-app.bat`

### 🌐 Acesso Remoto (Opcional)
Se precisar acessar o sistema de qualquer lugar via internet:
1. Certifique-se de que o backend está rodando.
2. Execute o arquivo `iniciar-tunel.bat`.
### 🧑‍💻 Exemplos de execução e troubleshooting (Windows/PowerShell)

Abaixo estão exemplos de comandos úteis para desenvolvedores e administradores ao rodar e diagnosticar o PDVsystem em ambiente Windows:

```powershell
# Ativa o modo Admin DB (NUNCA use em produção!) e inicia em modo desenvolvimento
$env:ENABLE_DB_ADMIN="true"; npm run dev

# Ativa o modo Admin DB e inicia em produção (apenas para testes locais)
$env:ENABLE_DB_ADMIN="true"; npm run start:prod
```
> **Comentário:**  
> A variável de ambiente `ENABLE_DB_ADMIN` permite acesso ao Admin DB Manager, que só deve ser usado localmente para manutenção ou testes. Nunca habilite em produção real.


### 🗄️ Inicializando o banco de dados manualmente

Se precisar criar o banco do zero (apenas para desenvolvedores ou ambientes de teste):

```sh
sqlite3 data/novabev.sqlite ".read server/src/db/migrations/0001_init.sql"
npm run migrate
```

- O primeiro comando cria o arquivo do banco e aplica a migration inicial.
- O segundo comando executa todas as migrations pendentes via script oficial.

> **Atenção:**  
> Não execute essas etapas em ambientes já provisionados ou em produção, pois pode sobrescrever dados existentes.

#### 🔎 Verificando se a porta 8787 está em uso

Para checar se o backend está rodando corretamente ou identificar conflitos de porta:

```powershell
netstat -ano | findstr 8787
```
> **Comentário:**  
> O comando acima lista todos os processos escutando na porta 8787. O número na última coluna é o PID (identificador do processo).

#### 🛑 Finalizando processo travado

Se precisar encerrar um processo que está usando a porta 8787 (por exemplo, após um crash ou travamento):

```powershell
taskkill /PID 15904 /F
```
> **Comentário:**  
> Substitua `15904` pelo PID retornado pelo comando anterior. O parâmetro `/F` força o encerramento imediato.

---

Esses comandos são úteis para resolver problemas comuns de ambiente, como porta ocupada ou necessidade de reiniciar o backend.  
Sempre verifique se o Admin DB está desabilitado (`ENABLE_DB_ADMIN=false`) em produção para garantir a segurança.

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
