# 🤝 Guia de Contribuição - PDVsystem

Obrigado por considerar contribuir com o PDVsystem! Este documento fornece diretrizes para contribuir com o projeto.

---

## 📋 Índice

- [Código de Conduta](#-código-de-conduta)
- [Como Posso Contribuir?](#-como-posso-contribuir)
- [Configurando o Ambiente](#️-configurando-o-ambiente-de-desenvolvimento)
- [Padrões de Código](#-padrões-de-código)
- [Processo de Pull Request](#-processo-de-pull-request)
- [Reportando Bugs](#-reportando-bugs)
- [Sugerindo Melhorias](#-sugerindo-melhorias)

---

## 📜 Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e colaborativo.

---

## 🎯 Como Posso Contribuir?

Existem várias formas de contribuir:

### 1. Reportar Bugs
Encontrou um bug? Abra uma issue com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
- Versão do sistema e ambiente

### 2. Sugerir Funcionalidades
Tem uma ideia? Abra uma issue de feature request com:
- Descrição detalhada da funcionalidade
- Casos de uso
- Benefícios esperados
- Mockups ou exemplos (se aplicável)

### 3. Melhorar Documentação
- Corrigir erros de digitação
- Adicionar exemplos
- Clarificar seções confusas
- Traduzir documentação

### 4. Contribuir com Código
- Corrigir bugs
- Implementar novas features
- Melhorar performance
- Refatorar código

---

## 🛠️ Configurando o Ambiente de Desenvolvimento

### Pré-requisitos

- **Node.js** v20.6.0 ou superior (recomendado v24)
- **npm** v8 ou superior
- **Git**
- **Windows** (para scripts .bat e PM2)
- **Editor de código** (recomendado: VS Code)

### Setup Inicial

```bash
# 1. Fork o repositório no GitHub

# 2. Clone seu fork
git clone https://github.com/SEU-USUARIO/PDVsystem.git
cd PDVsystem

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL/PDVsystem.git

# 4. Instale as dependências
npm install

# 5. Configure o ambiente
cp .env.example .env
# Edite .env conforme necessário

# 6. Execute as migrations
npm run migrate

# 7. Inicie o servidor de desenvolvimento
npm run dev
```

### Estrutura de Branches

- `main` - Branch principal (produção)
- `develop` - Branch de desenvolvimento
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Melhorias na documentação
- `refactor/*` - Refatorações

---

## 📝 Padrões de Código

### TypeScript

- Use TypeScript para todo código novo
- Defina tipos explícitos sempre que possível
- Evite `any` - use `unknown` se necessário
- Use interfaces para objetos complexos

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
}

// ❌ Evite
const user: any = { ... };
```

### Nomenclatura

- **Arquivos**: camelCase para arquivos TS/TSX (`userService.ts`)
- **Componentes**: PascalCase (`UserCard.tsx`)
- **Funções**: camelCase (`getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces/Types**: PascalCase (`UserData`)

### Estrutura de Arquivos

#### Backend (server/src/)

```
routes/
  ├── user.routes.ts       # Rotas HTTP
repositories/
  ├── user.repo.ts         # Acesso ao banco
services/
  ├── user.service.ts      # Lógica de negócio
```

#### Frontend

```
pages/
  ├── Users.tsx            # Página completa
components/
  ├── UserCard.tsx         # Componente reutilizável
  ├── modals/
  │   └── UserModal.tsx    # Modal específico
services/
  ├── user.ts              # Chamadas à API
```

### Comentários

- Comente **por que**, não **o que**
- Use JSDoc para funções públicas
- Mantenha comentários atualizados

```typescript
/**
 * Calcula o total de uma venda aplicando descontos
 * @param items - Itens da venda
 * @param discounts - Descontos a aplicar
 * @returns Total em centavos
 */
function calculateTotal(items: SaleItem[], discounts: Discount[]): number {
  // Implementação
}
```

### Formatação

- **Indentação**: 2 espaços
- **Aspas**: Simples para strings
- **Ponto e vírgula**: Sempre use
- **Linha máxima**: 100 caracteres (flexível)

### Git Commits

Use commits semânticos:

```
tipo(escopo): descrição curta

Descrição detalhada (opcional)

Refs: #123
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção

**Exemplos:**
```
feat(pos): adiciona suporte a multipagamento
fix(cash): corrige cálculo de diferença no fechamento
docs(api): atualiza documentação de endpoints
refactor(products): extrai lógica de validação para service
```

---

## 🔄 Processo de Pull Request

### Antes de Abrir o PR

1. **Sincronize com upstream**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Teste localmente**
   ```bash
   npm run build
   npm run migrate
   npm run start:prod
   ```

3. **Valide a documentação**
   ```bash
   npm run docs:check
   ```

4. **Verifique o código**
   - Sem erros de TypeScript
   - Sem console.logs desnecessários
   - Código formatado

### Abrindo o PR

1. **Crie uma branch descritiva**
   ```bash
   git checkout -b feature/adiciona-relatorio-vendas
   ```

2. **Faça commits atômicos**
   - Um commit por mudança lógica
   - Mensagens claras e descritivas

3. **Push para seu fork**
   ```bash
   git push origin feature/adiciona-relatorio-vendas
   ```

4. **Abra o PR no GitHub**
   - Título claro e descritivo
   - Descrição detalhada das mudanças
   - Referência a issues relacionadas
   - Screenshots/GIFs se aplicável

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Documentação atualizada
- [ ] Testes passando
- [ ] Build sem erros
- [ ] Sem conflitos com develop

## Screenshots
(se aplicável)

## Issues Relacionadas
Refs: #123
Closes: #456
```

### Revisão

- Responda aos comentários prontamente
- Faça as alterações solicitadas
- Mantenha a discussão profissional e construtiva
- Agradeça pelos reviews

---

## 🐛 Reportando Bugs

### Antes de Reportar

1. Verifique se já não existe uma issue aberta
2. Tente reproduzir em ambiente limpo
3. Colete informações do sistema

### Template de Bug Report

```markdown
## Descrição do Bug
Descrição clara e concisa do problema

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## Comportamento Esperado
O que deveria acontecer

## Comportamento Atual
O que realmente acontece

## Screenshots
(se aplicável)

## Ambiente
- OS: [Windows 10/11]
- Node.js: [v24.0.0]
- Versão do PDVsystem: [1.0.26]
- Browser: [Chrome 120]

## Logs
```
Cole logs relevantes aqui
```

## Informações Adicionais
Qualquer contexto adicional
```

---

## 💡 Sugerindo Melhorias

### Template de Feature Request

```markdown
## Problema a Resolver
Qual problema esta feature resolve?

## Solução Proposta
Como você imagina que isso funcione?

## Alternativas Consideradas
Outras formas de resolver o problema

## Casos de Uso
1. Como usuário X, eu quero Y para Z
2. ...

## Benefícios
- Benefício 1
- Benefício 2

## Mockups/Exemplos
(se aplicável)
```

---

## 🧪 Testes

### Testando Manualmente

1. **Desenvolvimento**
   ```bash
   npm run dev
   ```
   - Teste no navegador: `http://localhost:3000`
   - Teste a API: `http://localhost:8787/api/health`

2. **Produção**
   ```bash
   npm run build
   npm run start:prod
   ```
   - Teste no navegador: `http://localhost:8787`

### Áreas Críticas para Testar

- [ ] Login e autenticação
- [ ] Criação de venda no PDV
- [ ] Abertura e fechamento de caixa
- [ ] CRUD de produtos
- [ ] Geração de relatórios
- [ ] Controle de IP
- [ ] Admin DB Manager (apenas localhost)

---

## 📚 Atualizando Documentação

### Quando Atualizar

Atualize a documentação sempre que:
- Adicionar/modificar endpoints da API
- Criar/alterar migrations do banco
- Adicionar novas funcionalidades
- Mudar comportamento existente
- Adicionar variáveis de ambiente

### Arquivos a Atualizar

| Mudança | Arquivo |
|---------|---------|
| Novos endpoints | `docs/06-api-express.md` |
| Migrations | `docs/05-banco-de-dados.md` |
| Estrutura de pastas | `docs/04-estrutura-de-pastas-e-arquivos.md` |
| Regras de negócio | `docs/07-regras-de-negocio.md` |
| Instalação | `docs/09-instalacao-e-execucao.md` |
| Troubleshooting | `docs/13-troubleshooting.md` |

### Validação

```bash
npm run docs:check
```

---

## 🔐 Segurança

### Reportando Vulnerabilidades

**NÃO** abra issues públicas para vulnerabilidades de segurança.

Entre em contato diretamente com a equipe de desenvolvimento.

### Boas Práticas

- Nunca commite credenciais ou tokens
- Use `.env` para configurações sensíveis
- Não habilite `ENABLE_DB_ADMIN` em produção
- Mantenha dependências atualizadas

---

## 📞 Dúvidas?

- Consulte a [documentação completa](docs/README.md)
- Abra uma issue de discussão
- Entre em contato com a equipe

---

## 🙏 Agradecimentos

Obrigado por contribuir com o PDVsystem! Sua ajuda é muito apreciada.

---

<div align="center">

**Feito com ❤️ pela comunidade PDVsystem**

</div>
