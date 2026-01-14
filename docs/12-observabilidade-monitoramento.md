# 12 - Observabilidade e Monitoramento

## Logs
- pm2: `pm2 logs PDVsystem` para acompanhar backend em produção.
- Backend imprime acessos de IP (`[IPAccess]`) e operações de vendas/caixa no console.
- Telemetria de UI: eventos front registram em `/api/telemetry/track` e são gravados na tabela `logs` com mensagem `[page] area/action :: metaSummary` e contexto (`userId`, `tsClient`, `userAgent`, `path`, `ip`, `meta`).
- Logger de performance do servidor: roda no bootstrap, grava em `logs` o evento `Performance server` com métricas (cpuPct, load1/5/15, rssMb, heapUsedMb, osMemUsed/Total, eventLoopDelay p95/max, uptime, handles/requests, dbSizeMb). Intervalo configurável via `PERF_LOG_INTERVAL_MS` (default 60s, mínimo 5s); desliga com `PERF_LOG_ENABLED=false`.

## Métricas / Sys
- Rotas em `server/src/routes/sys`: `/api/sys/cpu` (uso CPU do host) e `/api/sys/mem` (RAM usada/total em GB).

## Frontend
- Páginas de caixa e settings exibem logs/mock events (ver `pages/Settings.tsx`).

## Interpretação
- Medidas de memória do browser ou heap devem ser convertidas para MB/GB ao exibir (se expostas pelos componentes).
