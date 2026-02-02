# 01 - Visão Geral

## O que é
PDVsystem é um sistema de ponto de venda e gestão, operando como SPA React servida por um backend Express em Node.

## Para quem
- Operadores de caixa (PDV).
- Gerentes e administradores (caixa, estoque, entidades, relatórios, configurações, DB Manager).


## Branding e Personalização
- O nome do sistema exibido na sidebar, login e título do navegador é definido pela variável de ambiente `VITE_APP_NAME` (em `.env`).
- O logo exibido na tela de login e sidebar pode ser customizado colocando um arquivo `logo.png` em `public/uploads/`.
- O título da aba do navegador é atualizado dinamicamente pelo frontend conforme `VITE_APP_NAME`.

## Módulos principais
- PDV: vendas, itens, pagamentos, recibos (ver `pages/POS.tsx`).
- Caixa: abertura/fechamento, suprimento, sangria, auditoria de movimentos (ver `pages/CashManagement.tsx`).
- Produtos/Categorias: cadastro e estoque (rotas `/api/products`, `/api/categories`).
- Entidades: usuários, clientes, fornecedores (rotas `/api/users`, `/api/clients`, `/api/suppliers`; UI em `pages/Entities.tsx`).
- Relatórios/BI: sold-products, product-mix, sessions-movements (rotas `/api/report`, `/api/reports`; UI em `pages/Reports.tsx`).
- Configurações: senha admin, permissões; inclui embed do DB Manager (ver `pages/Settings.tsx`).
- DB Manager: CRUD genérico/Query Builder protegido (rotas `/api/admin-db`).

## Limitações / Assunções
- Operação local por padrão (porta 8787); acesso condicionado a whitelist de IP para dispositivos na rede.
- Banco único SQLite em `data/novabev.sqlite` (WAL + foreign_keys).
- Valores monetários sempre em centavos no banco; timestamps em epoch ms.
- Admin DB Manager exige `ENABLE_DB_ADMIN=true` e acesso via localhost ou IP autorizado.
- Requer Node.js v20.6.0+ (recomendado v24+) para suporte nativo a `--env-file`.
