#!/usr/bin/env node
// scripts/bump-version.js
// Incrementa o patch da versão do package.json automaticamente

const fs = require('fs');
const path = require('path');


const pkgPath = path.join(__dirname, '..', 'package.json');
const envPath = path.join(__dirname, '..', '.env');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function bumpVersion(version) {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3) throw new Error('Versão inválida: ' + version);
  parts[2] += 1; // incrementa patch
  return parts.join('.');
}

const oldVersion = pkg.version;
const newVersion = bumpVersion(pkg.version);
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// Atualiza VITE_APP_VERSION no .env
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/VITE_APP_VERSION="[^"]*"/, `VITE_APP_VERSION="${newVersion}"`);
fs.writeFileSync(envPath, envContent);

console.log(`Versão do app atualizada: ${oldVersion} → ${newVersion}`);
