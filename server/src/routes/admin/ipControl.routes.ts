// server/src/routes/admin/ipControl.routes.ts
import { Router } from 'express';
import db from '../../db/database';

const router = Router();

// Listar IPs pendentes
router.get('/pending', (req, res) => {
  const ips = db.prepare('SELECT * FROM pending_ips ORDER BY tentado_em DESC').all();
  res.json(ips);
});

// Listar IPs autorizados
router.get('/allowed', (req, res) => {
  const ips = db.prepare('SELECT * FROM allowed_ips ORDER BY autorizado_em DESC').all();
  res.json(ips);
});

// Autorizar IP
router.post('/allow', (req, res) => {
  const { ip, hostname, autorizado_por } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP obrigatório' });
  // Remove de pending se existir
  db.prepare('DELETE FROM pending_ips WHERE ip = ?').run(ip);
  // Adiciona em allowed_ips
  db.prepare('INSERT OR IGNORE INTO allowed_ips (ip, hostname, autorizado_por) VALUES (?, ?, ?)').run(ip, hostname, autorizado_por || null);
  res.json({ ok: true });
});

// Negar IP (remove de pending, não autoriza)
router.post('/deny', (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP obrigatório' });
  db.prepare('DELETE FROM pending_ips WHERE ip = ?').run(ip);
  res.json({ ok: true });
});

// Remover IP autorizado
router.post('/remove', (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP obrigatório' });
  db.prepare('DELETE FROM allowed_ips WHERE ip = ?').run(ip);
  res.json({ ok: true });
});

export default router;
