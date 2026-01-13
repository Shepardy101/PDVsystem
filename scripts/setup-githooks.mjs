import { execSync } from 'child_process';

try {
  execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
  console.log('[setup-githooks] hooksPath configurado para .githooks');
} catch (err) {
  console.error('[setup-githooks] Falhou ao configurar hooksPath:', err.message);
  process.exit(1);
}
