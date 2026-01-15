import { Router } from 'express';
import { listLogs } from '../repositories/logs.repo';

const router = Router();

router.get('/', (req, res) => {
  const { limit, level } = req.query;
  let parsedLimit: number | 'all' = 100000;
  if (limit === 'all') {
    parsedLimit = 'all';
  } else if (limit) {
    const n = parseInt(String(limit), 10);
    if (!isNaN(n)) parsedLimit = n;
  }
  const levelFilter = level && typeof level === 'string' ? level : undefined;
  const logs = listLogs(parsedLimit, levelFilter as any);
  res.json({ logs });
});

export default router;
