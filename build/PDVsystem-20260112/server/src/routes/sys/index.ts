// server/src/routes/sys/index.ts
import { Router } from 'express';
import cpuRouter from './cpu.routes';
import memRouter from './mem.routes';

const router = Router();

router.use('/cpu', cpuRouter);
router.use('/mem', memRouter);

export default router;
