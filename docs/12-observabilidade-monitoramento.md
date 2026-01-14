# 12 - Observabilidade e Monitoramento

## Logs
- pm2: `pm2 logs PDVsystem` para acompanhar backend em produção.
- Backend imprime acessos de IP (`[IPAccess]`) e operações de vendas/caixa no console.
- Telemetria de UI: eventos front registram em `/api/telemetry/track` e são gravados na tabela `logs` com mensagem `[page] area/action :: metaSummary` e contexto (`userId`, `tsClient`, `userAgent`, `path`, `ip`, `meta`).

## Métricas / Sys
- Rotas em `server/src/routes/sys` (não abertas no recorte) podem expor CPU/Mem; lacuna registrada em `99-lacunas-perguntas.md`.

## Frontend
- Páginas de caixa e settings exibem logs/mock events (ver `pages/Settings.tsx`).

## Interpretação
- Medidas de memória do browser ou heap devem ser convertidas para MB/GB ao exibir (se expostas pelos componentes).
