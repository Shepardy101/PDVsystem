import { addLog, LogLevel } from '../repositories/logs.repo';

/**
 * Registra eventos de auditoria sem quebrar o fluxo em caso de erro de escrita.
 */
export function logEvent(message: string, level: LogLevel = 'info', context?: Record<string, unknown>) {
  try {
    return addLog(message, level, context);
  } catch (err) {
    console.error('[AUDIT] Falha ao registrar log:', err);
    return null;
  }
}
