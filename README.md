# NBPOS - PDV Portable

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
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

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
