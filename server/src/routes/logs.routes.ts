import { Router } from 'express';
import { listLogs } from '../repositories/logs.repo';

const router = Router();

router.get('/', (req, res) => {
  const { limit, level } = req.query;
  const parsedLimit = limit ? parseInt(String(limit), 10) : 100;
  const levelFilter = level && typeof level === 'string' ? level : undefined;
  const logs = listLogs(parsedLimit, levelFilter as any);
  res.json({ logs });
});

export default router;
