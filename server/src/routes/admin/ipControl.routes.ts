// server/src/routes/admin/ipControl.routes.ts
import { Router } from 'express';
import db from '../../db/database';
import { logEvent } from '../../utils/audit';

const router = Router();

// Listar IPs pendentes
router.get('/pending', (req, res) => {
  try {
    const ips = db.prepare('SELECT * FROM pending_ips ORDER BY tentado_em DESC').all();
    res.json(ips);
  } catch (err: any) {
    logEvent('Erro ao listar IPs pendentes', 'error', {
      message: err?.message || String(err),
      stack: err?.stack
    });
    res.status(500).json({ error: 'Erro ao listar IPs pendentes' });
  }
});

// Listar IPs autorizados
router.get('/allowed', (req, res) => {
  try {
    const ips = db.prepare('SELECT * FROM allowed_ips ORDER BY autorizado_em DESC').all();
    res.json(ips);
  } catch (err: any) {
    logEvent('Erro ao listar IPs autorizados', 'error', {
      message: err?.message || String(err),
      stack: err?.stack
    });
    res.status(500).json({ error: 'Erro ao listar IPs autorizados' });
  }
});

// Autorizar IP
router.post('/allow', (req, res) => {
  const { ip, hostname, autorizado_por } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP obrigatório' });
  try {
    db.prepare('DELETE FROM pending_ips WHERE ip = ?').run(ip);
    db.prepare('INSERT OR IGNORE INTO allowed_ips (ip, hostname, autorizado_por) VALUES (?, ?, ?)').run(ip, hostname, autorizado_por || null);
    logEvent('IP autorizado', 'info', { ip, hostname, autorizado_por: autorizado_por || null });
    res.json({ ok: true });
  } catch (err: any) {
    logEvent('Erro ao autorizar IP', 'error', {
      ip,
      hostname,
      autorizado_por: autorizado_por || null,
      message: err?.message || String(err),
      stack: err?.stack
    });
    res.status(500).json({ error: 'Erro ao autorizar IP' });
  }
});

// Negar IP (remove de pending, não autoriza)
router.post('/deny', (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP obrigatório' });
  try {
    db.prepare('DELETE FROM pending_ips WHERE ip = ?').run(ip);
    logEvent('IP negado', 'warn', { ip });
    res.json({ ok: true });
  } catch (err: any) {
    logEvent('Erro ao negar IP', 'error', {
      ip,
      message: err?.message || String(err),
      stack: err?.stack
    });
    res.status(500).json({ error: 'Erro ao negar IP' });
  }
});

// Remover IP autorizado
router.post('/remove', (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP obrigatório' });
  try {
    db.prepare('DELETE FROM allowed_ips WHERE ip = ?').run(ip);
    logEvent('IP removido da allowlist', 'warn', { ip });
    res.json({ ok: true });
  } catch (err: any) {
    logEvent('Erro ao remover IP da allowlist', 'error', {
      ip,
      message: err?.message || String(err),
      stack: err?.stack
    });
    res.status(500).json({ error: 'Erro ao remover IP' });
  }
});

export default router;
