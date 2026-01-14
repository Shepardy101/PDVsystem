// server/src/middleware/ipAccessControl.ts
import db from '../db/database';
import { Request, Response, NextFunction } from 'express';
import { logEvent } from '../utils/audit';

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
  const userAgent = (req.headers['user-agent'] as string) || null;
  const requestedPath = req.originalUrl || req.path;
  const requestMethod = req.method;
  const referer = (req.headers['referer'] as string) || (req.headers['referrer'] as string) || null;
  const acceptLanguage = (req.headers['accept-language'] as string) || null;
  const acceptHeader = (req.headers['accept'] as string) || null;
  const acceptEncoding = (req.headers['accept-encoding'] as string) || null;
  const forwardedForRaw = (req.headers['x-forwarded-for'] as string) || null;
  const remotePort = (req.socket as any)?.remotePort || null;
  const httpVersion = req.httpVersion || null;
  //console.log(`[IPAccess] Requisição recebida de IP: ${ip} | Hostname: ${hostname} | Path: ${req.path}`);


  // Permitir sempre localhost
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    //console.log(`[IPAccess] Acesso LOCAL liberado: ${ip} (${hostname})`);
    return next();
  }

  // Verifica se IP está autorizado
  const allowed = db.prepare('SELECT 1 FROM allowed_ips WHERE ip = ?').get(ip);

  if (allowed) {
    //console.log(`[IPAccess] IP autorizado: ${ip} (${hostname})`);
    return next();
  }

  // Registra tentativa se ainda não estiver em pending_ips
  const pending = db.prepare('SELECT 1 FROM pending_ips WHERE ip = ?').get(ip);
  let pendingStatus: 'created' | 'updated' | 'existing' = 'existing';

  if (!pending) {
    try {
      db.prepare(`
        INSERT INTO pending_ips (
          ip, hostname, user_agent, requested_path, request_method, referer,
          accept_language, accept_header, accept_encoding, forwarded_for_raw,
          remote_port, http_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        ip,
        hostname,
        userAgent,
        requestedPath,
        requestMethod,
        referer,
        acceptLanguage,
        acceptHeader,
        acceptEncoding,
        forwardedForRaw,
        remotePort,
        httpVersion
      );
      pendingStatus = 'created';
      logEvent('IP pendente registrado', 'warn', {
        ip,
        hostname,
        requestedPath,
        requestMethod,
        userAgent,
        referer,
        acceptLanguage,
        acceptHeader,
        acceptEncoding,
        forwardedForRaw,
        remotePort,
        httpVersion
      });
    } catch (err) {
      logEvent('Erro ao registrar IP pendente', 'error', {
        ip,
        hostname,
        requestedPath,
        message: (err as any)?.message || String(err)
      });
    }
  } else {
    try {
      db.prepare(`
        UPDATE pending_ips
        SET hostname = COALESCE(?, hostname),
            user_agent = ?,
            requested_path = ?,
            request_method = ?,
            referer = ?,
            accept_language = ?,
            accept_header = ?,
            accept_encoding = ?,
            forwarded_for_raw = ?,
            remote_port = ?,
            http_version = ?,
            tentado_em = CURRENT_TIMESTAMP
        WHERE ip = ?
      `).run(
        hostname || null,
        userAgent,
        requestedPath,
        requestMethod,
        referer,
        acceptLanguage,
        acceptHeader,
        acceptEncoding,
        forwardedForRaw,
        remotePort,
        httpVersion,
        ip
      );
      pendingStatus = 'updated';
      logEvent('IP pendente atualizado', 'warn', {
        ip,
        hostname,
        requestedPath,
        requestMethod,
        userAgent,
        referer,
        acceptLanguage,
        acceptHeader,
        acceptEncoding,
        forwardedForRaw,
        remotePort,
        httpVersion
      });
    } catch (err) {
      logEvent('Erro ao atualizar IP pendente', 'error', {
        ip,
        hostname,
        requestedPath,
        message: (err as any)?.message || String(err)
      });
    }
  }

  // Bloqueia acesso
  logEvent('Acesso bloqueado por whitelist', 'warn', {
    ip,
    hostname,
    requestedPath,
    requestMethod,
    userAgent,
    pendingStatus,
    referer,
    acceptLanguage,
    acceptHeader,
    acceptEncoding,
    forwardedForRaw,
    remotePort,
    httpVersion
  });
  // Se for requisição de navegador (aceita html), retorna página amigável
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.status(403).send(`
      <html style="background:#030308;color:#fff;font-family:sans-serif;text-align:center;min-height:100vh;display:flex;align-items:center;justify-content:center;">
        <head><title>Acesso Bloqueado</title></head>
        <body style="margin:0;">
          <div style="background:#111827cc;padding:2.5rem 2rem;border-radius:2rem;max-width:400px;margin:auto;box-shadow:0 8px 32px 0 rgba(0,0,0,0.8);border:1px solid #00e0ff33;">
            <div style="font-size:3rem;color:#fbbf24;">&#9888;</div>
            <h1 style="font-size:1.5rem;color:#00e0ff;margin-bottom:0.5rem;">Acesso Bloqueado</h1>
            <p style="color:#cbd5e1;font-size:1rem;">Seu dispositivo (<span style="font-family:monospace;">${ip || 'IP desconhecido'}</span>) está aguardando autorização do administrador para acessar o sistema.</p>
            ${hostname ? `<p style='color:#64748b;font-size:0.85rem;'>Hostname: ${hostname}</p>` : ''}
            <p style="color:#64748b;font-size:0.85rem;margin-top:1.5rem;">Se você é o administrador, autorize este IP no painel de controle.</p>
          </div>
        </body>
      </html>
    `);
  }
  // Caso contrário, retorna JSON
  return res.status(403).json({
    error: 'Aguardando autorização do administrador.',
    ip,
    hostname,
    aguardando: true
  });
}
