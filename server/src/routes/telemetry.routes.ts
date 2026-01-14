import { Router } from 'express';
import { logEvent } from '../utils/audit';

const router = Router();

router.post('/track', (req, res) => {
  const { userId, page, area, action, meta, ts } = req.body || {};
  if (!page || !area || !action) {
    return res.status(400).json({ error: 'page, area e action são obrigatórios' });
  }
  try {
    const tsClient = typeof ts === 'number' ? ts : Date.now();
    const safeMeta = meta && typeof meta === 'object' ? meta : null;
    const metaSummary = safeMeta
      ? Object.entries(safeMeta)
          .slice(0, 4)
          .map(([k, v]) => `${k}=${JSON.stringify(v).slice(0, 60)}`)
          .join(' | ')
      : '';
    const message = `[${page}] ${area}/${action}${metaSummary ? ` :: ${metaSummary}` : ''}`;

    logEvent(message, 'info', {
      userId: userId || null,
      page,
      area,
      action,
      meta: safeMeta,
      tsClient,
      userAgent: req.headers['user-agent'] || null,
      path: req.originalUrl || req.path,
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null,
    });
    res.json({ ok: true });
  } catch (err: any) {
    logEvent('Erro ao registrar UI event', 'error', { message: err?.message || String(err) });
    res.status(500).json({ error: 'Falha ao registrar evento' });
  }
});

export default router;
