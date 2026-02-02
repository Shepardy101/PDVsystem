# 📚 Documentação Técnica - PDVsystem

Bem-vindo à documentação técnica completa do **PDVsystem**. Esta documentação é organizada por categorias para facilitar a navegação.

---

## 🎯 Início Rápido

Novo no projeto? Comece por aqui:

1. **[Visão Geral](01-visao-geral.md)** - Entenda o que é o sistema e para quem é destinado
2. **[Instalação e Execução](09-instalacao-e-execucao.md)** - Configure e rode o projeto
3. **[Arquitetura](03-arquitetura.md)** - Compreenda a estrutura geral do sistema

---

## 📋 Índice por Categoria

### 🏗️ Fundamentos e Arquitetura

- **[01 - Visão Geral](01-visao-geral.md)**
  - O que é o PDVsystem
  - Público-alvo e casos de uso
  - Módulos principais
  - Branding e personalização

- **[02 - Stack e Dependências](02-stack-e-dependencias.md)**
  - Tecnologias frontend e backend
  - Dependências principais
  - Scripts npm disponíveis
  - Versões recomendadas

- **[03 - Arquitetura](03-arquitetura.md)**
  - Visão macro do sistema
  - Fluxo de dados (UI → API → DB)
  - UX keyboard-first e atalhos
  - Segurança e boundaries
  - Localização de componentes

- **[04 - Estrutura de Pastas e Arquivos](04-estrutura-de-pastas-e-arquivos.md)**
  - Organização de diretórios
  - Responsabilidades de cada pasta
  - Convenções de nomenclatura
  - Mapa de arquivos importantes

---

### 💾 Banco de Dados e API

- **[05 - Banco de Dados](05-banco-de-dados.md)**
  - Schema completo (SQLite)
  - Todas as 23 migrations documentadas
  - Tabelas, colunas e relacionamentos
  - PRAGMAs e configurações
  - Padrões de dados (centavos, epoch ms, UUIDs)

- **[06 - API Express](06-api-express.md)**
  - Todos os endpoints organizados por módulo
  - Middlewares globais
  - Exemplos de request/response
  - Códigos de erro
  - Guards e validações

---

### 📦 Funcionalidades e Regras de Negócio

- **[07 - Regras de Negócio](07-regras-de-negocio.md)**
  - Padrões gerais (valores, timestamps, IDs)
  - Vendas (POS)
  - Gestão de caixa
  - Estoque e produtos
  - Segurança de negócio
  - Auditoria e logs

- **[08 - Relatórios e BI](08-relatorios-e-bi.md)**
  - Endpoints de relatórios
  - Product Mix e análises
  - Campos e cálculos
  - Parâmetros de período
  - UI de relatórios

---

### ⚙️ Instalação, Deploy e Produção

- **[09 - Instalação e Execução](09-instalacao-e-execucao.md)**
  - Pré-requisitos
  - Setup de desenvolvimento
  - Build para produção
  - Distribuição para clientes
  - Variáveis de ambiente
  - Banco de dados

- **[10 - Automação Windows e PM2](10-automacao-windows-e-pm2.md)**
  - Scripts .bat disponíveis
  - Uso do PM2
  - Comandos úteis
  - Quando usar cada script

- **[15 - Sistema de Atualizações](15-sistema-de-atualizacoes.md)**
  - Como funciona o update automático
  - Preparar uma atualização
  - Hospedar atualizações
  - Configurar clientes
  - API de update

---

### 🔒 Segurança e Manutenção

- **[11 - Segurança e Guardrails](11-seguranca-e-guardrails.md)**
  - Controle de IP (whitelist)
  - Admin DB Manager
  - Reset do banco
  - Boas práticas de segurança

- **[12 - Observabilidade e Monitoramento](12-observabilidade-monitoramento.md)**
  - Logs (PM2 e aplicação)
  - Telemetria de UI
  - Logger de performance
  - Métricas de sistema (CPU/RAM)
  - Interpretação de dados

---

### 🔧 Troubleshooting e Referência

- **[13 - Troubleshooting](13-troubleshooting.md)**
  - Porta ocupada
  - Banco de dados travado
  - Migrations falhando
  - IP bloqueado
  - Admin DB inacessível
  - Scripts .bat fechando

- **[14 - Glossário](14-glossario.md)**
  - Termos técnicos
  - Conceitos do sistema
  - Abreviações

- **[99 - Lacunas e Perguntas](99-lacunas-perguntas.md)**
  - Pontos a serem expandidos
  - Referências para código-fonte

---

## 📊 Resumo Executivo

### O que é o PDVsystem?

PDVsystem é um **sistema completo de ponto de venda e gestão** para distribuidores de bebidas, desenvolvido como uma **SPA React** servida por um **backend Node/Express** na porta 8787.

### Características Principais

- **Porta padrão**: 8787
- **Banco de dados**: SQLite único em `data/novabev.sqlite` (WAL mode)
- **Controle de acesso**: Whitelist de IP obrigatória
- **Valores monetários**: Sempre em centavos (inteiros)
- **Timestamps**: Epoch ms (milissegundos desde 1970)
- **IDs**: TEXT/UUID

### Módulos do Sistema

1. **PDV** - Terminal de vendas, pagamentos, recibos
2. **Caixa** - Abertura/fechamento, movimentos, auditoria
3. **Produtos** - Cadastro, estoque, categorias
4. **Entidades** - Usuários, clientes, fornecedores
5. **Relatórios** - BI, analytics, dashboards
6. **Configurações** - Admin, permissões, DB Manager
7. **Monitoramento** - Logs, métricas, performance

### Fluxo Básico

```
UI (React) → fetch → /api/* → Express Middleware → Routes → Repositories → SQLite → Response JSON
```

### Exceções de Segurança

Rotas que **não** passam pelo controle de IP:
- `/api/health` - Health check
- `/api/admin-db` - DB Manager (protegido por guard)
- `/api/admin/ip-control` - Gestão de IPs
- `/api/admin/maintenance` - Manutenção
- `/uploads` - Arquivos estáticos

### Admin DB Manager

⚠️ **ATENÇÃO**: Protegido por:
- Flag `ENABLE_DB_ADMIN=true` no `.env`
- Acesso apenas via localhost
- **NUNCA habilite em produção pública!**

---

## 🗺️ Mapa de Rotas da API

### Principais Endpoints

| Módulo | Rota Base | Descrição |
|--------|-----------|-----------|
| **POS** | `/api/pos` | Vendas e finalização |
| **Caixa** | `/api/cash` | Sessões, movimentos, histórico |
| **Produtos** | `/api/products` | CRUD de produtos/serviços |
| **Categorias** | `/api/categories` | CRUD de categorias |
| **Usuários** | `/api/users` | Autenticação e gestão |
| **Clientes** | `/api/clients` | CRUD de clientes |
| **Fornecedores** | `/api/suppliers` | CRUD de fornecedores |
| **Relatórios** | `/api/report` | Produtos vendidos |
| **BI** | `/api/reports` | Product Mix e analytics |
| **Configurações** | `/api/settings` | Configurações do sistema |
| **Logs** | `/api/logs` | Auditoria e telemetria |
| **Telemetria** | `/api/telemetry` | Tracking de eventos |
| **Sistema** | `/api/sys` | Métricas (CPU/RAM) |
| **Admin DB** | `/api/admin-db` | DB Manager (CRUD genérico) |
| **IP Control** | `/api/admin/ip-control` | Whitelist de IPs |
| **Manutenção** | `/api/admin/maintenance` | Purge cache, wipe |
| **Health** | `/api/health` | Status do servidor |

Detalhes completos: **[06 - API Express](06-api-express.md)**

---

## 🏗️ Estrutura de Pastas (Resumo)

```
PDVsystem/
├── pages/                    # Páginas React principais
│   ├── POS.tsx              # Terminal de vendas
│   ├── CashManagement.tsx   # Gestão de caixa
│   ├── Products.tsx         # Gestão de produtos
│   ├── Entities.tsx         # Usuários/Clientes/Fornecedores
│   ├── Reports.tsx          # Relatórios e BI
│   ├── Settings.tsx         # Configurações e admin
│   └── Login.tsx            # Autenticação
│
├── components/              # Componentes reutilizáveis
│   ├── modals/             # Modais (pagamento, sangria, etc.)
│   └── reports/            # Componentes de relatórios
│
├── services/               # Camada de serviços frontend
├── hooks/                  # Hooks customizados React
│
├── server/
│   ├── src/
│   │   ├── index.ts        # Entrypoint do backend
│   │   ├── routes/         # Rotas da API
│   │   ├── repositories/   # Acesso ao banco
│   │   ├── services/       # Lógica de negócio
│   │   ├── middleware/     # Middlewares (IP control)
│   │   └── db/
│   │       ├── database.ts # Conexão SQLite
│   │       ├── migrate.ts  # Executor de migrations
│   │       └── migrations/ # 23 arquivos .sql
│   └── dist/               # Build do backend
│
├── dist/                   # Build do frontend (Vite)
├── data/                   # Banco SQLite + WAL/SHM
├── public/uploads/         # Arquivos enviados
├── docs/                   # Esta documentação
└── scripts/                # Scripts de build/validação
```

Detalhes completos: **[04 - Estrutura de Pastas](04-estrutura-de-pastas-e-arquivos.md)**

---

## 📖 Como Usar Esta Documentação

### Para Desenvolvedores Novos
1. Leia [01 - Visão Geral](01-visao-geral.md)
2. Configure o ambiente com [09 - Instalação](09-instalacao-e-execucao.md)
3. Estude a [03 - Arquitetura](03-arquitetura.md)
4. Explore a [06 - API](06-api-express.md) conforme necessário

### Para Manutenção
1. Consulte [13 - Troubleshooting](13-troubleshooting.md) para problemas comuns
2. Veja [12 - Observabilidade](12-observabilidade-monitoramento.md) para logs e métricas
3. Use [11 - Segurança](11-seguranca-e-guardrails.md) para questões de acesso

### Para Deploy
1. Siga [09 - Instalação](09-instalacao-e-execucao.md) seção de produção
2. Configure [10 - Automação Windows](10-automacao-windows-e-pm2.md)
3. Implemente [15 - Sistema de Atualizações](15-sistema-de-atualizacoes.md)

### Para Entender o Código
1. Estude [03 - Arquitetura](03-arquitetura.md) para fluxos
2. Consulte [05 - Banco de Dados](05-banco-de-dados.md) para schema
3. Veja [07 - Regras de Negócio](07-regras-de-negocio.md) para validações

---

## 🤝 Como Contribuir com a Documentação

Ao alterar o código, **sempre atualize a documentação correspondente**:

- Mudou rotas? → Atualize [06 - API Express](06-api-express.md)
- Adicionou migration? → Atualize [05 - Banco de Dados](05-banco-de-dados.md)
- Criou serviço? → Atualize [03 - Arquitetura](03-arquitetura.md)
- Mudou páginas? → Atualize [04 - Estrutura](04-estrutura-de-pastas-e-arquivos.md)

### Validação

Antes de commitar, rode:

```bash
npm run docs:check
```

O hook de pre-commit bloqueará se faltar arquivo ou referência.

---

## 🔗 Links Externos

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

## 📞 Suporte

Para dúvidas, lacunas ou sugestões de melhoria na documentação:
- Consulte [99 - Lacunas e Perguntas](99-lacunas-perguntas.md)
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

---

<div align="center">

**Documentação mantida e atualizada pela equipe PDVsystem**

Última atualização: Fevereiro 2026 | Versão: 1.0.26

</div>
