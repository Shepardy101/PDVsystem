import fs from 'fs';
import os from 'os';
import path from 'path';
import { monitorEventLoopDelay } from 'perf_hooks';
import { logEvent } from '../utils/audit';

const DEFAULT_INTERVAL_MS = 60_000;
let intervalHandle: NodeJS.Timer | null = null;

function getCpuUsagePercent(): number {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  for (const cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }
  const total = user + nice + sys + idle + irq;
  if (total === 0) return 0;
  return Math.round(100 - (idle / total) * 100);
}

function getDbSizeBytes(): number | null {
  try {
    const dbPath = path.resolve(__dirname, '../../data/novabev.sqlite');
    const stat = fs.statSync(dbPath);
    return stat.size;
  } catch {
    return null;
  }
}

function formatMb(bytes: number | null | undefined): number | null {
  if (!bytes && bytes !== 0) return null;
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

function collectServerMetrics() {
  const mem = process.memoryUsage();
  const osTotal = os.totalmem();
  const osFree = os.freemem();
  const elDelay = monitorEventLoopDelay({ resolution: 10 });
  elDelay.enable();

  const cpuPct = getCpuUsagePercent();
  const load = os.loadavg();
  const handles = (process as any)._getActiveHandles?.().length ?? null;
  const requests = (process as any)._getActiveRequests?.().length ?? null;
  const dbSize = getDbSizeBytes();

  const metrics = {
    reason: 'scheduled',
    cpuPct,
    load1: Math.round(load[0] * 100) / 100,
    load5: Math.round(load[1] * 100) / 100,
    load15: Math.round(load[2] * 100) / 100,
    rssMb: formatMb(mem.rss),
    heapUsedMb: formatMb(mem.heapUsed),
    heapTotalMb: formatMb(mem.heapTotal),
    externalMb: formatMb(mem.external),
    osMemUsedMb: formatMb(osTotal - osFree),
    osMemTotalMb: formatMb(osTotal),
    uptimeSec: Math.round(process.uptime()),
    handles,
    requests,
    dbSizeMb: formatMb(dbSize ?? undefined),
  } as Record<string, unknown>;

  // medir delay após pequeno timeout para popular histogram
  setTimeout(() => {
    const p95 = Math.round(elDelay.percentile(95) / 1_000_000); // ns -> ms
    const max = Math.round(elDelay.max / 1_000_000);
    elDelay.disable();
    elDelay.reset();
    metrics.eventLoopDelayP95Ms = p95;
    metrics.eventLoopDelayMaxMs = max;
    logEvent('Performance server', 'info', metrics);
  }, 20);
}

export function startPerformanceLogger() {
  const enabled = process.env.PERF_LOG_ENABLED !== 'false';
  if (!enabled) return;
  const intervalMs = Math.max(5_000, Number(process.env.PERF_LOG_INTERVAL_MS) || DEFAULT_INTERVAL_MS);
  if (intervalHandle) return;

  collectServerMetrics();
  intervalHandle = setInterval(collectServerMetrics, intervalMs);
}
