# NBPOS - PDV Portable
# Como gerar e rodar a versão de produção (Windows)
# Guia detalhado de build, empacotamento e uso

## O que cada comando faz e o que é gerado

### 1. `npm install`
Instala todas as dependências do projeto (Node.js, React, Express, etc). Não cria novas pastas, apenas atualiza/instala `node_modules/` e `package-lock.json`.

### 2. `npm run build`
Gera o build do frontend (Vite):
- Cria/atualiza a pasta `dist/` na raiz do projeto.
- Dentro de `dist/`:
   - `index.html` (página principal)
   - `assets/` (arquivos JS/CSS otimizados)
   - `uploads/` (imagens de produtos, se existirem)

### 3. `cd build && package-app.bat`
Empacota tudo para produção:
- Cria uma nova pasta `PDVsystem-YYYYMMDD/` dentro de `build/` (YYYYMMDD = data do build).
- Copia para essa pasta:
   - `dist/` (frontend pronto)
   - `node_modules/` (dependências)
   - `novabev.sqlite` (banco de dados)
   - `uploads/` (imagens)
   - Scripts `.bat` (instalar, iniciar, atalho)
   - `package.json` e `package-lock.json`
- Gera o arquivo `PDVsystem-YYYYMMDD.zip` com todo o conteúdo acima.

### 4. Extração e instalação
Ao extrair o `.zip`, você terá:
- Pasta `PDVsystem-YYYYMMDD/` com:
   - `dist/` (frontend)
   - `node_modules/` (dependências)
   - `novabev.sqlite` (banco)
   - `uploads/` (imagens)
   - Scripts `.bat`
   - `package.json`, `package-lock.json`, `README.md`

### 5. `instalar-app.bat`
Instala dependências na pasta extraída (caso precise atualizar ou instalar em outro PC). Atualiza/cria `node_modules/`.

### 6. `iniciar-app.bat`
Inicia o backend e abre o sistema no navegador em modo app.
- Backend escuta na porta 8787.
- O navegador abre automaticamente em modo app (janela dedicada).

### 7. `criar-atalho-app.bat`
Cria um atalho na área de trabalho para abrir o sistema rapidamente.

---

## Como utilizar o sistema
1. Extraia o `.zip` em uma pasta de sua escolha.
2. Execute `instalar-app.bat` (apenas na primeira vez ou após atualização de dependências).
3. Execute `iniciar-app.bat` para rodar o sistema.
4. (Opcional) Execute `criar-atalho-app.bat` para criar o atalho.
5. O sistema abrirá automaticamente no navegador em modo app. Você pode acessar também via http://localhost:8787 ou pelo IP da máquina.
6. Para liberar acesso externo, autorize o IP no painel admin.

---

## Estrutura final da pasta extraída
```
PDVsystem-YYYYMMDD/
├── dist/                # Frontend pronto para produção
│   ├── index.html
│   └── assets/
├── node_modules/        # Dependências do Node.js
├── novabev.sqlite       # Banco de dados SQLite
├── uploads/             # Imagens de produtos
├── instalar-app.bat     # Instala dependências
├── iniciar-app.bat      # Inicia o sistema
├── criar-atalho-app.bat # Cria atalho na área de trabalho
├── package.json
├── package-lock.json
├── README.md
└── ...
```

---

## Observações importantes
- O controle de IP estará ativo em produção.
- O banco de dados (novabev.sqlite) e imagens ficam na pasta extraída.
- Para liberar acesso externo, autorize o IP no painel admin.
- Scripts .bat automatizam todo o processo.
- Não é necessário Node instalado no cliente final (portable).

---

## Passo a passo completo

### 1. Preparar ambiente
1. Certifique-se de que todos os arquivos estejam salvos e o projeto atualizado.
2. Abra o terminal na pasta raiz do projeto.

### 2. Instalar dependências
```sh
npm install
```

### 3. Gerar build do frontend
```sh
npm run build
```
O build será gerado na pasta `dist/`.

### 4. Empacotar aplicação para produção
Execute o script de empacotamento:
```sh
cd build
package-app.bat
```
Isso irá criar a pasta `PDVsystem-YYYYMMDD` e o arquivo `PDVsystem-YYYYMMDD.zip` com tudo pronto para uso.

### 5. Instalar e rodar o sistema
1. Extraia o arquivo `.zip` em uma pasta de sua escolha.
2. Abra a pasta extraída.
3. Execute o script de instalação:
```sh
instalar-app.bat
```
4. Execute o script de inicialização:
```sh
iniciar-app.bat
```
O sistema irá instalar dependências, iniciar o backend e abrir o navegador em modo app.

### 6. Criar atalho na área de trabalho (opcional)
```sh
criar-atalho-app.bat
```

### 7. Acessar o sistema
O sistema abrirá automaticamente no navegador em modo app. Você pode acessar também via http://localhost:8787 ou pelo IP da máquina.

---

## Observações importantes
- O controle de IP estará ativo em produção.
- O banco de dados (novabev.sqlite) e imagens ficam na pasta extraída.
- Para liberar acesso externo, autorize o IP no painel admin.
- Scripts .bat automatizam todo o processo.

---

## Resumo dos comandos principais
- `npm install` — Instala dependências
- `npm run build` — Gera build do frontend
- `build/package-app.bat` — Empacota tudo para produção
- `instalar-app.bat` — Instala dependências na pasta extraída
- `iniciar-app.bat` — Inicia o sistema e abre o navegador
- `criar-atalho-app.bat` — Cria atalho na área de trabalho

## Comandos de Desenvolvimento

- `npm run dev` — Inicia Vite (porta 3000) + API backend (porta 8787) em modo watch.
- `npm run dev:api` — Inicia apenas o backend (porta 8787) em modo watch.

## Proxy Vite
- O proxy `/api` no Vite está configurado para `http://localhost:8787`.

## Como testar
1. Rode `npm install` (se não rodou ainda)
2. Rode `npm run dev`
3. Acesse http://localhost:3000 (frontend)
4. Teste a API: http://localhost:8787/api/health

## Observações
- O backend usa apenas `import/export` (ESM).
- O backend roda com TSX (não use ts-node-dev).
- O Vite sempre na porta 3000, API sempre na 8787.
# NBPOS - PDV Portable

## Checklist de Desenvolvimento

### DEV
- [x] `npm install` (instala dependências frontend e backend)
- [x] `npm run dev` (Vite + API em paralelo)
- [x] Frontend acessa API via `/api` (proxy)

### PROD LOCAL
- [x] `npm run build` (gera dist/ do Vite)
- [x] `npm run start:local` (server serve dist/ e API na mesma porta)

### PORTABLE (Windows)
- [ ] Gerar build do frontend: `npm run build`
- [ ] Gerar bundle do server (CJS): `npm run build:server`
- [ ] Montar pasta `dist-package/`:
   - `server/node.exe` (baixar do site oficial)
   - `server/server.cjs` (bundle do server)
   - `server/start-server.bat` (inicia node.exe server.cjs)
   - `app/` (conteúdo de dist/ do Vite)
   - `data/novabev.sqlite` (criado na primeira execução)

### Scripts principais
- `npm run dev` - Vite + API (dev)
- `npm run build` - Build frontend + backend
- `npm run start:local` - Servidor local (prod)

### Observações
- O backend usa SQLite em arquivo, persistente.
- O frontend consome dados da API local.
- Não é necessário Node instalado no cliente final (portable).

---

## Estrutura do Backend
- `server/src/index.ts` - Bootstrap Express + static
- `server/src/db/database.ts` - Conexão SQLite
- `server/src/routes/health.routes.ts` - Health check
- `server/src/db/migrations/0001_init.sql` - Schema inicial

## Próximos passos
- Implementar endpoints de produtos, vendas, caixa, etc.
- Refatorar POS.tsx para buscar produtos via API.
- Implementar build/bundle do server para portable.

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17BmGhalxErcEbSyha5cvGteT2_DeIc5F

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`



   # PROXIMA ATUALIZAÇÃO SISTEMA DE KILOS

## Como gerar e empacotar a versão de produção (build leve)

## Passo a passo para produção

### 1. Instalar dependências para build
Execute na raiz do projeto:
```
npm install
```

### 2. Gerar build do frontend e backend
```
npm run build
```
- Frontend gerado em `dist/`
- Backend gerado em `server/dist/`

### 3. Empacotar a aplicação (build leve)
Execute na raiz do projeto:
```
package-app.bat
```
O pacote gerado estará em `build/PDVsystem-YYYYMMDD.zip`.

**O pacote inclui:**
- dist/ (frontend)
- public/uploads/ (imagens)
- data/novabev.sqlite (banco)
- server/ (backend compilado)
- server/migrations/ (migrations do banco)
- Scripts .bat (instalar, iniciar, atalho)
- package.json, package-lock.json, README.md

**Não inclui:**
- node_modules (as dependências serão instaladas no cliente)

### 4. Instalação e uso no cliente
1. Instale o Node.js na máquina do cliente.
2. Extraia o pacote .zip em uma pasta de sua escolha.
3. Execute `instalar-app.bat` para instalar as dependências.
4. Execute `iniciar-app.bat` para iniciar o sistema.
5. (Opcional) Execute `criar-atalho-app.bat` para criar o atalho.

O sistema abrirá automaticamente no navegador em modo app. Você pode acessar também via http://localhost:8787.

---

## Checklist do pacote
- [x] dist/
- [x] public/uploads/
- [x] data/novabev.sqlite
- [x] server/
- [x] server/migrations/
- [x] instalar-app.bat
- [x] iniciar-app.bat
- [x] criar-atalho-app.bat
- [x] package.json
- [x] package-lock.json
- [x] README.md

---

## Observações
- O build leve agiliza o empacotamento e reduz o tamanho do pacote.
- As dependências são instaladas no cliente via `instalar-app.bat`.
- Sempre execute o build antes de empacotar para garantir que o backend e frontend estejam atualizados.
- Mantenha as migrations no pacote para inicialização do banco.

Se precisar de instruções específicas para atualização ou migração, consulte o README ou solicite suporte.
