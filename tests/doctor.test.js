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
  'community-ui.js',
  'index.html',
  'styles.css',
  'README.md',
  'SECURITY.md',
  'COPYRIGHT.md',
  'docs/STANDALONE_OPERATION.md'
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
  assert.match(pkg.scripts?.check || '', /community-ui\.js/);
});

test('editor core has no required organization identity dependency', () => {
  const allDependencies = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  for (const name of ['openid-client', 'passport', '@auth0/auth0-react']) assert.equal(allDependencies[name], undefined);
});

test('security-sensitive runtime dependencies are declared', () => {
  assert.match(pkg.devDependencies?.electron || '', /^\^(43|44)\./);
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
  assert.match(html, /community-ui\.js/);
});

test('main window keeps Electron isolation controls', () => {
  const main = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
  assert.match(main, /contextIsolation:\s*true/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /sandbox:\s*true/);
});

test('workspace replacement backs up files before writing', () => {
  const main = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
  const copy = main.indexOf('fs.copyFileSync(filePath, backupPath)');
  const write = main.indexOf("fs.writeFileSync(filePath, content.replace(matcher, replace), 'utf8')");
  assert.ok(copy >= 0, 'missing replacement backup');
  assert.ok(write > copy, 'replacement write must happen after backup');
});

test('community UI keeps unsaved-work protection and diagnostics entry points', () => {
  const ui = fs.readFileSync(path.join(root, 'community-ui.js'), 'utf8');
  assert.match(ui, /discard unsaved changes/i);
  assert.match(ui, /beforeunload/);
  assert.match(ui, /railInfo/);
  assert.match(ui, /window\.thoth\?\.ping/);
  assert.match(ui, /event\.key === 'F1'/);
});
