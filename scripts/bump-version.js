#!/usr/bin/env node
// scripts/bump-version.js
// Incrementa o patch da versão do package.json automaticamente

const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function bumpVersion(version) {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3) throw new Error('Versão inválida: ' + version);
  parts[2] += 1; // incrementa patch
  return parts.join('.');
}

const oldVersion = pkg.version;
pkg.version = bumpVersion(pkg.version);

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`Versão do app atualizada: ${oldVersion} → ${pkg.version}`);
