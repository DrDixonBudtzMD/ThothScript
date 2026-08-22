#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail || '' });
}

const requiredFiles = [
  'main.js',
  'preload.js',
  'renderer.js',
  'community-ui.js',
  'index.html',
  'styles.css',
  'package.json',
  'package-lock.json',
  'README.md',
  'SECURITY.md'
];

for (const file of requiredFiles) {
  check(`required file: ${file}`, fs.existsSync(path.join(root, file)), file);
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
check('Node.js >= 22', nodeMajor >= 22, process.version);
check('Electron dependency declared', Boolean(pkg.devDependencies?.electron), pkg.devDependencies?.electron || 'missing');
check('@electron/packager declared', Boolean(pkg.devDependencies?.['@electron/packager']), pkg.devDependencies?.['@electron/packager'] || 'missing');
check('package is private', pkg.private === true, `private=${String(pkg.private)}`);
check('main entry exists', Boolean(pkg.main) && fs.existsSync(path.join(root, pkg.main || '')), pkg.main || 'missing');
check('check script exists', Boolean(pkg.scripts?.check), pkg.scripts?.check || 'missing');
check('package-win script exists', Boolean(pkg.scripts?.['package-win']), pkg.scripts?.['package-win'] || 'missing');

let lock = null;
try {
  lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  check('package-lock parses', true, `lockfileVersion=${lock.lockfileVersion}`);
} catch (error) {
  check('package-lock parses', false, error.message);
}

if (lock) {
  const lockRoot = lock.packages?.[''] || {};
  check('lockfile project name matches package', lockRoot.name === pkg.name, `${lockRoot.name || 'missing'} vs ${pkg.name}`);
  check('lockfile Electron range matches package', lockRoot.devDependencies?.electron === pkg.devDependencies?.electron, `${lockRoot.devDependencies?.electron || 'missing'} vs ${pkg.devDependencies?.electron || 'missing'}`);
}

console.log(`ThothScript Doctor — ${pkg.version}`);
console.log(`Platform: ${process.platform} ${process.arch}`);
console.log(`Node: ${process.version}`);
console.log('');

for (const item of checks) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'}  ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
}

const failed = checks.filter(item => !item.ok);
console.log('');
console.log(`${checks.length - failed.length}/${checks.length} checks passed.`);

if (failed.length) {
  console.error('Doctor found project setup problems.');
  process.exitCode = 1;
} else {
  console.log('Project structure looks healthy.');
}
