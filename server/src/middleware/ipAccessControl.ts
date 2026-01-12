// server/src/middleware/ipAccessControl.ts
import db from '../db/database';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para filtrar e registrar IPs de acesso.
 * - Permite apenas IPs autorizados (allowed_ips).
 * - Registra tentativas de IPs não autorizados em pending_ips.
 * - Bloqueia acesso e retorna mensagem amigável para IPs não autorizados.
 */
export async function ipAccessControl(req: Request, res: Response, next: NextFunction) {
  // Captura IP real (X-Forwarded-For se atrás de proxy)
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
  const hostname = req.hostname || null;

  // Permitir sempre localhost
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    return next();
  }

  // Verifica se IP está autorizado
  const allowed = db.prepare('SELECT 1 FROM allowed_ips WHERE ip = ?').get(ip);
  if (allowed) {
    return next();
  }

  // Registra tentativa se ainda não estiver em pending_ips
  const pending = db.prepare('SELECT 1 FROM pending_ips WHERE ip = ?').get(ip);
  if (!pending) {
    db.prepare('INSERT INTO pending_ips (ip, hostname) VALUES (?, ?)').run(ip, hostname);
  }

  // Bloqueia acesso
  return res.status(403).json({
    error: 'Aguardando autorização do administrador.',
    ip,
    hostname,
    aguardando: true
  });
}
