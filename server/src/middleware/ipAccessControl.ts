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
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
  const hostname = req.hostname || req.headers['host'] || null;
  console.log(`[IPAccess] Requisição recebida de IP: ${ip} | Hostname: ${hostname} | Path: ${req.path}`);


  // Permitir sempre localhost
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    console.log(`[IPAccess] Acesso LOCAL liberado: ${ip} (${hostname})`);
    return next();
  }

  // Verifica se IP está autorizado
  const allowed = db.prepare('SELECT 1 FROM allowed_ips WHERE ip = ?').get(ip);

  if (allowed) {
    console.log(`[IPAccess] IP autorizado: ${ip} (${hostname})`);
    return next();
  }

  // Registra tentativa se ainda não estiver em pending_ips
  const pending = db.prepare('SELECT 1 FROM pending_ips WHERE ip = ?').get(ip);

  if (!pending) {
    try {
      db.prepare('INSERT INTO pending_ips (ip, hostname) VALUES (?, ?)').run(ip, hostname);
      console.log(`[IPAccess] IP PENDENTE registrado no banco: ${ip} (${hostname})`);
    } catch (err) {
      console.error(`[IPAccess] ERRO ao registrar IP pendente: ${ip} (${hostname})`, err);
    }
  } else {
    console.log(`[IPAccess] IP PENDENTE já registrado: ${ip} (${hostname})`);
  }

  // Bloqueia acesso
  console.log(`[IPAccess] BLOQUEADO: ${ip} (${hostname}) tentou acessar ${req.path}`);
  return res.status(403).json({
    error: 'Aguardando autorização do administrador.',
    ip,
    hostname,
    aguardando: true
  });
}
