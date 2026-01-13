# Plano de Implantação — PDVsystem

## 1. Visão Geral do Sistema

O **PDVsystem** é uma solução de ponto de venda (POS) para distribuidores de bebidas, com foco em performance, controle de estoque, vendas, auditoria de caixa e relatórios em tempo real.

- **Frontend**: SPA React (Vite) servida pelo backend.
- **Backend**: Node.js/Express (TypeScript) com SQLite, responsável por autenticação, lógica de negócios, controle de caixa, estoque, relatórios e controle de IP.
- **Banco de Dados**: SQLite, persistido em arquivo local.
- **Scripts de automação**: `.bat` para Windows, facilitando instalação, inicialização e criação de atalhos.

**Interconexão**: Frontend e backend rodam no mesmo host, comunicando-se via HTTP (`localhost:8787`). O backend serve tanto a API quanto os arquivos estáticos do frontend.

---

## 2. Controle de IPs e Portas

- **Porta principal**: `8787` (HTTP, backend e frontend).
- **Controle de IP**: Apenas IPs autorizados podem acessar o sistema (tabela `allowed_ips`). IPs não autorizados são registrados em `pending_ips` e bloqueados até aprovação.
- **Firewall**: Permitir entrada na porta `8787` apenas para IPs confiáveis (idealmente, apenas rede local). Bloquear todas as outras portas não utilizadas. Se acesso externo for necessário, restringir por IP e considerar VPN.

---

## 3. Empacotamento e Estrutura de Arquivos/Pastas

- **Empacotamento**: O script [`build/package-app.bat`](build/package-app.bat) gera um `.zip` com todos os arquivos essenciais.
- **Estrutura recomendada após extração**:
  ```
  PDVsystem-YYYYMMDD/
  ├── dist/                # Frontend pronto para produção
  ├── public/uploads/      # Imagens de produtos
  ├── data/novabev.sqlite  # Banco de dados SQLite
  ├── server/              # Backend compilado (Node.js)
  ├── server/migrations/   # Scripts de migração do banco
  ├── node_modules/        # (gerado após instalar dependências)
  ├── instalar-app.bat     # Instala dependências e backend
  ├── iniciar-app.bat      # Inicia backend e frontend
  ├── criar-atalho-app.bat # Cria atalho na área de trabalho
  ├── package.json
  ├── package-lock.json
  ├── README.md
  └── ...
  ```

---

## 4. Scripts de Instalação e Inicialização

- **Instalação**: Execute `instalar-app.bat` para instalar dependências, pm2 e configurar o backend como serviço.
- **Inicialização**: Execute `iniciar-app.bat` para iniciar o backend (via pm2) e abrir o frontend no Chrome em modo app.
- **Criação de atalho**: Execute `criar-atalho-app.bat` para criar um atalho na área de trabalho.
- **Parada do sistema**: Para parar o backend: `pm2 stop PDVsystem`. Para reiniciar: `pm2 restart PDVsystem`.
- **Comandos manuais (caso automação falhe)**:
  1. `npm install` (instalar dependências)
  2. `npm run build` (gerar frontend/backend)
  3. `pm2 start server/dist/index.js --name PDVsystem --env production`
  4. Abrir `http://localhost:8787` no navegador

---

## 5. Geração de Build e Preparação para Produção

- **Build do Frontend**: Execute `npm run build:client` para gerar a pasta `dist/` com os arquivos otimizados do React.
- **Build do Backend**: Execute `npm run build:server` para compilar o código TypeScript do backend para `server/dist/`.
- **Build Completo**: Execute `npm run build` para compilar frontend e backend juntos.
- **Validação**: Certifique-se de que `dist/` e `server/dist/` estejam presentes e completos.

---

## 6. Preparação do Banco de Dados para Produção

- **Migrações**: Execute os scripts de migração localizados em `server/migrations/` e `server/src/db/migrations/` para criar e atualizar o banco de dados `data/novabev.sqlite`.
- **População Inicial**: Garanta que o usuário root/admin e dados essenciais estejam criados via migrations.
- **Backup**: Realize um backup do banco após a preparação inicial.

---

## 7. Empacotamento e Distribuição

- **Empacotamento**: Utilize o script `build/package-app.bat` para gerar um pacote `.zip` com todos os arquivos necessários para o cliente.
- **Checklist de Conteúdo**: O pacote deve conter: `dist/`, `server/dist/`, `data/novabev.sqlite`, `public/uploads/`, scripts `.bat`, `package.json`, `README.md` e demais arquivos essenciais.
- **Distribuição**: Envie o pacote ao cliente final ou equipe de operações para implantação.

---

## 8. Estrutura da Aplicação e Acesso

- **Estrutura interna**: Frontend: SPA React em `dist/`. Backend: Node.js/Express em `server/dist/index.js`. API: `/api/*`
- **Acesso**: URL padrão: `http://localhost:8787`. Login inicial: Usuário: `root`, Senha: `root` (ou conforme definido em migração). Autenticação: JWT/session (verificar implementação). Controle de IP: Apenas IPs autorizados podem acessar (admin libera via painel).

---

## 9. Plano de Funcionamento e Monitoramento

- **Fluxo principal**:
  1. Backend inicia via pm2.
  2. Frontend é servido pelo backend.
  3. Usuário acessa via navegador (modo app).
  4. Controle de IP bloqueia acessos não autorizados.
  5. Operações de venda, estoque, caixa e relatórios são realizadas normalmente.
- **Monitoramento**: Logs do backend via pm2 (`pm2 logs PDVsystem`). Logs de acesso e eventos críticos no banco (`logs`, `cash_movements`, etc). Recomenda-se configurar alertas para falhas críticas (ex: falha ao iniciar backend, corrupção do banco).
- **Recuperação de desastres**: Backup regular do arquivo `data/novabev.sqlite` e da pasta `public/uploads/`. Em caso de falha, restaurar o backup mais recente. Documentar procedimentos de restauração e reset de senha admin/root.

---

## Checklist de Implantação e Operação

- [ ] Validar ambiente do cliente (Windows, Node.js instalado, Chrome disponível)

- [ ] Gerar build do frontend (`npm run build:client`)
- [ ] Gerar build do backend (`npm run build:server`)
- [ ] Gerar build completo (`npm run build`)
- [ ] Executar migrações do banco (primeira inicialização)
- [ ] Preparar banco de dados para produção (população inicial, backup)
- [ ] Empacotar aplicação para distribuição (`package-app.bat`)
- [ ] Instalar dependências (`instalar-app.bat`)
- [ ] Iniciar backend e frontend (`iniciar-app.bat`)
- [ ] Testar acesso local e controle de IP
- [ ] Autorizar IPs necessários via painel admin
- [ ] Testar login com usuário root/admin
- [ ] Realizar testes manuais de vendas, estoque, caixa e relatórios
- [ ] Validar geração de backups e restauração
- [ ] Validar logs e monitoramento do backend
- [ ] Corrigir eventuais bugs encontrados
- [ ] Atualizar documentação conforme ajustes
- [ ] Validar instalação e uso em ambiente de produção
- [ ] Checklist final aprovado e versão marcada como estável

---

> **Observação:** Sempre priorize a automação e a segurança. Restrinja o acesso ao backend e ao banco de dados, mantenha backups regulares e monitore o sistema em produção.