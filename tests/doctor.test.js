const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const lock = require(path.join(root, 'package-lock.json'));

const requiredFiles = [
  'main.js',
  'preload.js',
  'renderer.js',
  'index.html',
  'styles.css',
  'README.md',
  'SECURITY.md',
  'COPYRIGHT.md'
];

test('required application files exist', () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);
  }
});

test('package remains private and exposes required scripts', () => {
  assert.equal(pkg.private, true);
  assert.equal(typeof pkg.scripts?.start, 'string');
  assert.equal(typeof pkg.scripts?.check, 'string');
  assert.equal(typeof pkg.scripts?.['package-win'], 'string');
  assert.equal(typeof pkg.scripts?.doctor, 'string');
  assert.equal(typeof pkg.scripts?.test, 'string');
});

test('security-sensitive runtime dependencies are declared', () => {
  assert.match(pkg.devDependencies?.electron || '', /^\^43\./);
  assert.equal(typeof pkg.devDependencies?.['@electron/packager'], 'string');
});

test('lockfile root agrees with package dependencies', () => {
  const lockRoot = lock.packages?.[''];
  assert.ok(lockRoot, 'missing lockfile root package');
  assert.equal(lockRoot.name, pkg.name);
  assert.equal(lockRoot.devDependencies?.electron, pkg.devDependencies?.electron);
  assert.equal(lockRoot.devDependencies?.['@electron/packager'], pkg.devDependencies?.['@electron/packager']);
});

test('renderer document keeps a restrictive content security policy', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /Content-Security-Policy/i);
  assert.match(html, /default-src 'self'/);
  assert.match(html, /object-src 'none'/);
});

test('main window keeps Electron isolation controls', () => {
  const main = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
  assert.match(main, /contextIsolation:\s*true/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /sandbox:\s*true/);
});
