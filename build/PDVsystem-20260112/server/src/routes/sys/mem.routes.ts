// server/src/routes/sys/mem.routes.ts
import { Router } from 'express';
import os from 'os';

const router = Router();

router.get('/', (req, res) => {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  // Converte para GB com 1 casa decimal
  res.json({
    used: +(used / 1024 / 1024 / 1024).toFixed(1),
    total: +(total / 1024 / 1024 / 1024).toFixed(1)
  });
});

export default router;
