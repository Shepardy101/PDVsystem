import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const requiredFiles = [
  'docs/README.md',
  'docs/01-visao-geral.md',
  'docs/02-stack-e-dependencias.md',
  'docs/03-arquitetura.md',
  'docs/04-estrutura-de-pastas-e-arquivos.md',
  'docs/05-banco-de-dados.md',
  'docs/06-api-express.md',
  'docs/07-regras-de-negocio.md',
  'docs/08-relatorios-e-bi.md',
  'docs/09-instalacao-e-execucao.md',
  'docs/10-automacao-windows-e-pm2.md',
  'docs/11-seguranca-e-guardrails.md',
  'docs/12-observabilidade-monitoramento.md',
  'docs/13-troubleshooting.md',
  'docs/14-glossario.md',
  'docs/15-sistema-de-atualizacoes.md'
];

function fail(msg) {
  console.error(`[docs-check] ${msg}`);
  process.exit(1);
}

// 1) existência
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) fail(`Arquivo obrigatório ausente: ${file}`);
}

// 2) README deve referenciar todos os arquivos
const readme = fs.readFileSync('docs/README.md', 'utf8');
for (const file of requiredFiles.slice(1)) {
  const base = path.basename(file).replace('.md', '');
  if (!readme.includes(base)) fail(`docs/README.md não referencia ${base}`);
}

// 3) Verificar alterações staged em rotas/migrations e avisar
try {
  const diff = execSync('git diff --name-only --cached', { encoding: 'utf8' }).split('\n');
  const routeChanged = diff.some(f => f.startsWith('server/src/routes/'));
  const migrationChanged = diff.some(f => f.startsWith('server/src/db/migrations'));
  if (routeChanged && !diff.includes('docs/06-api-express.md')) {
    console.warn('[docs-check] Rotas alteradas; revise docs/06-api-express.md');
  }
  if (migrationChanged && !diff.includes('docs/05-banco-de-dados.md')) {
    console.warn('[docs-check] Migrations alteradas; revise docs/05-banco-de-dados.md');
  }
} catch (err) {
  console.warn('[docs-check] Não foi possível inspecionar git diff (ok continuar).');
}

console.log('[docs-check] OK');
