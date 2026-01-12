// server/src/routes/sys/cpu.routes.ts
import { Router } from 'express';
import os from 'os';

const router = Router();

// Função para estimar uso de CPU do processo Node em %
function getCpuUsagePercent(): number {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  for (let cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }
  const total = user + nice + sys + idle + irq;
  // Retorna percentual de uso (100 - % idle)
  return Math.round(100 - (idle / total) * 100);
}

router.get('/', (req, res) => {
  const cpu = getCpuUsagePercent();
  res.json({ cpu });
});

export default router;
