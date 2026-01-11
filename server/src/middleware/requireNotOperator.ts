import { Request, Response, NextFunction } from 'express';

// Middleware: bloqueia acesso se user.role === 'operator'
export function requireNotOperator(req: Request, res: Response, next: NextFunction) {
  // Supondo que req.user já está preenchido pelo middleware de autenticação
  const user = req.user as { role?: string } | undefined;
  if (user && user.role === 'operator') {
    return res.status(403).json({ error: 'Acesso restrito para operadores.' });
  }
  next();
}
