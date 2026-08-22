const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const LS = {
  sidebarVisible: 'thoth_sidebar_visible',
  sidebarWidth: 'thoth_sidebar_width',
  openFolders: 'thoth_open_folders',
  recentFiles: 'thoth_recent_files',
  session: 'thoth_session_v03'
};

const state = {
  tabs: [],
  active: null,
  folder: null,
  bridge: false,
  openFolders: new Set(JSON.parse(localStorage.getItem(LS.openFolders) || '[]')),
  recentFiles: JSON.parse(localStorage.getItem(LS.recentFiles) || '[]'),
  markdownPreview: false,
  commandIndex: 0,
  commandFiltered: []
};

const els = {
  app: $('app'),
  tabs: $('tabs'),
  text: $('textEditor'),
  code: $('codeEditor'),
  hex: $('hexEditor'),
  tree: $('tree'),
  recentFiles: $('recentFiles'),
  fileInfo: $('fileInfo'),
  modeInfo: $('modeInfo'),
  cursorInfo: $('cursorInfo'),
  wordInfo: $('wordInfo'),
  status: $('status'),
  hint: $('hint'),
  sidebar: $('sidebar'),
  sideTitle: $('sideTitle'),
  explorerPanel: $('explorerPanel'),
  searchPanel: $('searchPanel'),
  searchInput: $('searchInput'),
  replaceInput: $('replaceInput'),
  searchCase: $('searchCase'),
  searchRegex: $('searchRegex'),
  searchWhole: $('searchWhole'),
  searchResults: $('searchResults'),
  lineNums: $('lineNums'),
  resizer: $('resizer'),
  editorShell: $('editorShell'),
  markdownPreview: $('markdownPreview'),
  commandOverlay: $('commandOverlay'),
  commandInput: $('commandInput'),
  commandList: $('commandList')
};

function id(){ return Math.random().toString(16).slice(2) + Date.now().toString(16); }
function activeTab(){ return state.tabs.find(t => t.id === state.active) || null; }
function setStatus(msg){ els.status.textContent = msg || 'Ready'; }
function setHint(msg){ els.hint.textContent = msg || 'Ready'; }

function currentEditorFor(tab){
  if (!tab) return els.text;
  if (tab.kind === 'binary') return els.hex;
  return tab.mode === 'code' ? els.code : els.text;
}

function persistActive(){
  const tab = activeTab();
  if (!tab) return;
  if (tab.kind === 'binary') tab.hex = els.hex.value;
  else if (tab.mode === 'code') tab.text = els.code.value;
  else tab.text = els.text.value;
}

function getIcon(tab){
  if (!tab) return '📄';
  if (tab.kind === 'binary') return '◫';
  const name = (tab.title || '').toLowerCase();
  if (name.endsWith('.js') || name.endsWith('.ts')) return '⚙';
  if (name.endsWith('.html')) return '🌐';
  if (name.endsWith('.css')) return '🎨';
  if (name.endsWith('.py')) return '🐍';
  if (name.endsWith('.json')) return '{}';
  if (name.endsWith('.md')) return '◆';
  if (name.endsWith('.sql')) return 'DB';
  return tab.mode === 'code' ? '<>' : '📄';
}

function titleFromPath(filePath){
  return String(filePath || '').split(/[\\/]/).pop() || 'Untitled';
}

function extensionOf(name){
  return (String(name || '').split('.').pop() || '').toLowerCase();
}

function langLabel(tab){
  const ext = extensionOf(tab.title);
  const map = {
    js:'JavaScript', jsx:'JavaScript JSX', ts:'TypeScript', tsx:'TypeScript TSX', py:'Python',
    html:'HTML', css:'CSS', scss:'SCSS', json:'JSON', md:'Markdown', xml:'XML',
    yml:'YAML', yaml:'YAML', sql:'SQL', sh:'Shell', ps1:'PowerShell', bat:'Batch',
    java:'Java', c:'C', cpp:'C++', h:'C/C++ Header', go:'Go', rs:'Rust', php:'PHP', rb:'Ruby'
  };
  return map[ext] || 'Code';
}

function showEditor(tab){
  els.text.style.display = 'none';
  els.code.style.display = 'none';
  els.hex.style.display = 'none';

  if (!tab) {
    els.text.style.display = '';
    els.text.value = '';
    els.fileInfo.textContent = 'No file';
    els.modeInfo.textContent = 'Plain Text';
    updateStats();
    return;
  }

  if (tab.kind === 'binary') {
    els.hex.style.display = '';
    els.hex.value = tab.hex || '';
    els.hex.focus();
    els.modeInfo.textContent = 'Hex/Binary';
  } else if (tab.mode === 'code') {
    els.code.style.display = '';
    els.code.value = tab.text || '';
    els.code.focus();
    els.modeInfo.textContent = langLabel(tab);
  } else {
    els.text.style.display = '';
    els.text.value = tab.text || '';
    els.text.focus();
    els.modeInfo.textContent = extensionOf(tab.title) === 'md' ? 'Markdown' : 'Plain Text';
  }
  els.fileInfo.textContent = tab.path || 'Unsaved';
  updateStats();
  updateMarkdownPreview();
}

function renderTabs(){
  els.tabs.innerHTML = '';
  state.tabs.forEach(tab => {
    const div = document.createElement('div');
    div.className = 'tab' + (tab.id === state.active ? ' active' : '');
    div.innerHTML = `
      <span class="tabicon">${esc(getIcon(tab))}</span>
      <span class="tabmode">${tab.kind === 'binary' ? 'HEX' : (tab.mode === 'code' ? 'CODE' : (extensionOf(tab.title)==='md'?'MD':'TEXT'))}</span>
      <span class="tabtitle">${esc(tab.title)}${tab.dirty ? ' •' : ''}</span>
      <button class="tabclose">×</button>
    `;
    div.onclick = (e) => {
      if (e.target.classList.contains('tabclose')) return;
      switchTab(tab.id);
    };
    div.querySelector('.tabclose').onclick = (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    };
    els.tabs.appendChild(div);
  });
}

function addTab(payload){
  persistActive();
  const existing = payload.path ? state.tabs.find(t => t.path === payload.path) : null;
  if (existing) {
    state.active = existing.id;
    renderTabs();
    showEditor(existing);
    return existing;
  }
  const tab = {
    id: id(),
    title: payload.title || 'Untitled',
    path: payload.path || null,
    kind: payload.kind || 'text',
    mode: payload.mode || 'plain',
    text: payload.text || '',
    hex: payload.hex || '',
    dirty: false
  };
  state.tabs.push(tab);
  state.active = tab.id;
  renderTabs();
  showEditor(tab);
  saveSessionDebounced();
  return tab;
}

function switchTab(tabId){
  persistActive();
  state.active = tabId;
  renderTabs();
  showEditor(activeTab());
  saveSessionDebounced();
}

function closeTab(tabId){
  const index = state.tabs.findIndex(t => t.id === tabId);
  if (index < 0) return;
  const wasActive = state.active === tabId;
  state.tabs.splice(index, 1);
  if (wasActive) state.active = state.tabs[index - 1]?.id || state.tabs[index]?.id || null;
  renderTabs();
  showEditor(activeTab());
  saveSessionDebounced();
}

function markDirty(){
  const tab = activeTab();
  if (!tab) return;
  persistActive();
  tab.dirty = true;
  renderTabs();
  updateStats();
  updateMarkdownPreview();
  saveSessionDebounced();
}

function setMode(mode){
  const tab = activeTab();
  if (!tab || tab.kind === 'binary') return;
  persistActive();
  tab.mode = mode === 'code' ? 'code' : 'plain';
  renderTabs();
  showEditor(tab);
  setStatus(tab.mode === 'code' ? 'Code mode' : 'Plain text mode');
}

async function newText(){
  addTab({ title:'Untitled.txt', kind:'text', mode:'plain', text:'' });
  setStatus('New plain text file');
}
async function newCode(){
  addTab({ title:'Untitled.code', kind:'text', mode:'code', text:'' });
  setStatus('New code file');
}
async function newMarkdown(){
  addTab({ title:'Untitled.md', kind:'text', mode:'plain', text:'# Untitled\n\nStart writing...' });
  setStatus('New Markdown file');
}

async function openFile(){
  if (!state.bridge) return setStatus('Bridge offline — check preload/main');
  const res = await window.thoth.openFileDialog();
  if (!res) return;
  handleFilePayload(res);
}
async function openFilePath(filePath){
  if (!state.bridge) return setStatus('Bridge offline — check preload/main');
  const res = await window.thoth.readFile(filePath);
  if (!res?.ok) {
    state.recentFiles = state.recentFiles.filter(p => p !== filePath);
    localStorage.setItem(LS.recentFiles, JSON.stringify(state.recentFiles));
    renderRecentFiles();
  }
  handleFilePayload(res);
}
function handleFilePayload(res){
  if (!res?.ok) return setStatus(res?.error || 'Open failed');
  if (res.kind === 'binary') {
    addTab({ title: res.name, path: res.filePath, kind:'binary', mode:'hex', hex: formatHex(res.hex) });
    setStatus('Opened binary file in hex mode');
  } else {
    const likelyCode = /\.(js|ts|py|html|css|json|xml|yml|yaml|java|c|cpp|h|rs|go|php|rb|sql|sh|ps1|bat)$/i.test(res.filePath);
    addTab({ title: res.name, path: res.filePath, kind:'text', mode: likelyCode ? 'code' : 'plain', text: res.text || '' });
    addRecent(res.filePath);
    setStatus('Opened file');
  }
}
function formatHex(hex){
  return String(hex || '').match(/.{1,2}/g)?.join(' ') || '';
}

function addRecent(filePath){
  if (!filePath) return;
  state.recentFiles = [filePath, ...state.recentFiles.filter(p => p !== filePath)].slice(0, 15);
  localStorage.setItem(LS.recentFiles, JSON.stringify(state.recentFiles));
  renderRecentFiles();
}
function renderRecentFiles(){
  if (!state.recentFiles.length) {
    els.recentFiles.innerHTML = '<div class="empty">No recent files yet.</div>';
    return;
  }
  els.recentFiles.innerHTML = '';
  state.recentFiles.forEach(fp => {
    const div = document.createElement('div');
    div.className = 'recentItem';
    div.innerHTML = `<span>${esc(getIcon({title:titleFromPath(fp)}))}</span><span>${esc(titleFromPath(fp))}</span>`;
    div.title = fp;
    div.onclick = () => openFilePath(fp);
    els.recentFiles.appendChild(div);
  });
}

async function save(forceSaveAs=false){
  if (!state.bridge) return setStatus('Bridge offline — check preload/main');
  const tab = activeTab();
  if (!tab) return;
  persistActive();

  let out;
  if (tab.kind === 'binary') {
    out = await window.thoth.saveBinaryHex({
      filePath: tab.path,
      hex: tab.hex,
      forceSaveAs,
      defaultName: tab.title || 'Untitled.bin'
    });
  } else {
    out = await window.thoth.saveText({
      filePath: tab.path,
      text: tab.text,
      forceSaveAs,
      defaultName: tab.title || 'Untitled.txt'
    });
  }

  if (!out?.ok) {
    if (!out?.canceled) setStatus(out?.error || 'Save failed');
    return;
  }
  tab.path = out.filePath;
  tab.title = titleFromPath(out.filePath);
  tab.dirty = false;
  addRecent(out.filePath);
  renderTabs();
  showEditor(tab);
  setStatus('Saved');
  saveSessionDebounced();
  if (!state.tabs.some(t => t.dirty)) window.thoth.clearRecovery().catch(()=>{});
}

function buildPrintableHtml(tab){
  persistActive();
  const isMarkdown = tab.kind !== 'binary' && extensionOf(tab.title) === 'md';
  const content = tab.kind === 'binary' ? tab.hex : tab.text;
  const isCode = tab.kind === 'binary' || tab.mode === 'code';
  const body = isMarkdown ? markdownToHtml(content) : `<pre>${esc(content)}</pre>`;
  return `<!doctype html><html><head><meta charset="utf-8">
    <style>
      @page{ margin:18mm; }
      body{font-family:${isCode ? 'Consolas, monospace' : 'system-ui, Arial'};color:#111;margin:0;}
      pre{white-space:pre-wrap;word-break:break-word;font-size:${isCode ? '11px' : '13px'};line-height:1.42;}
      code{background:#eee;padding:2px 5px;border-radius:4px;} pre code{background:transparent;padding:0;}
      h1,h2,h3{break-after:avoid;} img{max-width:100%;}
    </style></head><body>${body}</body></html>`;
}

async function exportPdf(){
  if (!state.bridge) return setStatus('Bridge offline — check preload/main');
  const tab = activeTab();
  if (!tab) return;
  const html = buildPrintableHtml(tab);
  const out = await window.thoth.exportPdfHtml({ html, suggestedName: (tab.title || 'ThothScript') + '.pdf' });
  if (!out?.ok) {
    if (!out?.canceled) setStatus(out?.error || 'PDF export failed');
    return;
  }
  setStatus('PDF exported');
}

async function printCurrent(){
  if (!state.bridge) return setStatus('Bridge offline — check preload/main');
  const tab = activeTab();
  if (!tab) return;
  const out = await window.thoth.printHtml({ html: buildPrintableHtml(tab) });
  if (!out?.ok) return setStatus(out?.error || 'Print failed');
  setStatus('Print sent');
}

async function openFolder(){
  if (!state.bridge) return setStatus('Bridge offline — check preload/main');
  const res = await window.thoth.openFolderDialog();
  if (!res) return;
  state.folder = res.folderPath;
  showPanel('explorer', true);
  await renderRootTree(res.folderPath, res.entries);
  setStatus('Folder opened');
  saveSessionDebounced();
}

async function renderRootTree(rootPath, entries){
  els.tree.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'treeitem folder';
  root.innerHTML = `<span class="twisty">▾</span><span>${esc(titleFromPath(rootPath))}</span>`;
  els.tree.appendChild(root);
  const block = document.createElement('div');
  els.tree.appendChild(block);
  entries.forEach(entry => block.appendChild(treeRow(entry, 1)));
}

function treeRow(entry, depth){
  const row = document.createElement('div');
  row.className = 'treeitem ' + entry.type;
  row.style.paddingLeft = `${8 + depth*16}px`;
  row.innerHTML = `<span class="twisty">${entry.type === 'folder' ? (state.openFolders.has(entry.path) ? '▾' : '▸') : '•'}</span><span>${esc(entry.name)}</span>`;
  row.dataset.path = entry.path;
  row.dataset.type = entry.type;

  if (entry.type === 'file') {
    row.onclick = () => openFilePath(entry.path);
    return row;
  }

  const childBlock = document.createElement('div');
  childBlock.style.display = state.openFolders.has(entry.path) ? '' : 'none';
  row.onclick = async () => {
    const open = !state.openFolders.has(entry.path);
    if (open) state.openFolders.add(entry.path);
    else state.openFolders.delete(entry.path);
    localStorage.setItem(LS.openFolders, JSON.stringify(Array.from(state.openFolders)));
    row.querySelector('.twisty').textContent = open ? '▾' : '▸';
    childBlock.style.display = open ? '' : 'none';
    if (open && childBlock.childElementCount === 0) {
      const res = await window.thoth.listDir(entry.path);
      if (!res?.ok) return setStatus(res?.error || 'Could not list folder');
      res.entries.forEach(child => childBlock.appendChild(treeRow(child, depth + 1)));
    }
  };
  const wrap = document.createElement('div');
  wrap.appendChild(row);
  wrap.appendChild(childBlock);
  if (state.openFolders.has(entry.path)) {
    window.thoth.listDir(entry.path).then(res => {
      if (res?.ok && childBlock.childElementCount === 0) res.entries.forEach(child => childBlock.appendChild(treeRow(child, depth + 1)));
    });
  }
  return wrap;
}

function findInCurrent(){
  const tab = activeTab();
  if (!tab) return;
  const q = prompt('Find');
  if (!q) return;
  const editor = currentEditorFor(tab);
  const start = editor.selectionEnd || 0;
  const hay = editor.value;
  let idx = hay.toLowerCase().indexOf(q.toLowerCase(), start);
  if (idx < 0) idx = hay.toLowerCase().indexOf(q.toLowerCase(), 0);
  if (idx >= 0) {
    editor.focus();
    editor.setSelectionRange(idx, idx + q.length);
    setStatus('Found match');
  } else setStatus('No match');
}

async function workspaceSearch(doReplace=false){
  if (!state.bridge) return setStatus('Bridge offline — check preload/main');
  if (!state.folder) return setStatus('Open a folder first');
  const query = els.searchInput.value.trim();
  if (!query) return setStatus('Type a search query');
  if (doReplace && !confirm('Replace all matches across workspace? ThothScript will create safety backups first.')) return;
  els.searchResults.innerHTML = '<div class="empty">Searching...</div>';
  const res = await window.thoth.searchFiles({
    root: state.folder,
    query,
    replace: els.replaceInput.value,
    matchCase: els.searchCase.checked,
    regex: els.searchRegex.checked,
    wholeWord: els.searchWhole.checked,
    doReplace,
    maxFiles: 900
  });
  if (!res?.ok) {
    els.searchResults.innerHTML = `<div class="empty">${esc(res?.error || 'Search failed')}</div>`;
    return;
  }
  if (!res.results.length) {
    els.searchResults.innerHTML = '<div class="empty">No matches.</div>';
    return;
  }
  els.searchResults.innerHTML = '';
  res.results.forEach(hit => {
    const div = document.createElement('div');
    div.className = 'searchHit';
    div.innerHTML = `<strong>${esc(hit.name)} : ${hit.line}</strong><div class="path">${esc(hit.filePath)}</div><div class="preview">${esc(hit.preview)}</div>`;
    div.onclick = () => openFilePath(hit.filePath);
    els.searchResults.appendChild(div);
  });
  setStatus(res.replaced ? `Replaced in ${res.results.length} files` : `${res.results.length} search results`);
}

function showPanel(name, forceOpen=false){
  const isCollapsed = els.app.classList.contains('sidebar-collapsed');
  const currentExplorer = els.explorerPanel.style.display !== 'none';
  const currentSearch = els.searchPanel.style.display !== 'none';

  document.querySelectorAll('.railbtn').forEach(b => b.classList.remove('active'));
  els.explorerPanel.style.display = 'none';
  els.searchPanel.style.display = 'none';

  if (name === 'search') {
    if (!forceOpen && !isCollapsed && currentSearch) {
      toggleSidebar(false);
      return;
    }
    $('railSearch').classList.add('active');
    els.sideTitle.textContent = 'Search';
    els.searchPanel.style.display = '';
    toggleSidebar(true);
    setTimeout(() => els.searchInput.focus(), 0);
  } else {
    if (!forceOpen && !isCollapsed && currentExplorer) {
      toggleSidebar(false);
      return;
    }
    $('railExplorer').classList.add('active');
    els.sideTitle.textContent = 'Explorer';
    els.explorerPanel.style.display = '';
    toggleSidebar(true);
  }
}

function toggleSidebar(force){
  const collapsed = els.app.classList.contains('sidebar-collapsed');
  const shouldShow = typeof force === 'boolean' ? force : collapsed;
  els.app.classList.toggle('sidebar-collapsed', !shouldShow);
  localStorage.setItem(LS.sidebarVisible, shouldShow ? '1' : '0');
  setStatus(shouldShow ? 'Explorer shown' : 'Explorer hidden');
}

function applySavedLayout(){
  els.app.classList.remove('focus-mode');
  const visible = localStorage.getItem(LS.sidebarVisible);
  if (visible === '0') els.app.classList.add('sidebar-collapsed');
  else els.app.classList.remove('sidebar-collapsed');
  const width = Number(localStorage.getItem(LS.sidebarWidth) || 290);
  document.documentElement.style.setProperty('--sidebar-width', `${Math.min(Math.max(width, 190), 520)}px`);
}

function wireResizer(){
  let dragging = false;
  els.resizer.addEventListener('mousedown', () => {
    dragging = true;
    document.body.style.cursor = 'col-resize';
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.cursor = '';
    const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'));
    localStorage.setItem(LS.sidebarWidth, String(w));
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const width = Math.min(Math.max(e.clientX - 54, 190), 520);
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
  });
}

function toggleFocus(force){
  const next = typeof force === 'boolean' ? force : !els.app.classList.contains('focus-mode');
  els.app.classList.toggle('focus-mode', next);
  setStatus(next ? 'Focus mode — press Esc or F11 to exit' : 'Workspace mode');
  setTimeout(() => {
    const ed = currentEditorFor(activeTab());
    if (ed) ed.focus();
    updateStats();
  }, 0);
}

function currentText(){
  const tab = activeTab();
  if (!tab) return '';
  persistActive();
  return tab.kind === 'binary' ? (tab.hex || '') : (tab.text || '');
}

function updateLineNumbers(){
  const editor = currentEditorFor(activeTab());
  const count = Math.max(1, editor.value.split('\n').length);
  els.lineNums.textContent = Array.from({length: count}, (_, i) => String(i + 1)).join('\n');
}

function updateCursor(){
  const tab = activeTab();
  const editor = currentEditorFor(tab);
  const pos = editor.selectionStart || 0;
  const before = editor.value.slice(0, pos);
  const line = before.split('\n').length;
  const col = before.length - before.lastIndexOf('\n');
  els.cursorInfo.textContent = `Ln ${line}, Col ${col}`;
}

function updateStats(){
  const text = currentText();
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  els.wordInfo.textContent = `Words: ${words} | Chars: ${chars}`;
  updateLineNumbers();
  updateCursor();
}

function maybeAutoPair(editor, e){
  const pairs = { '(':')', '[':']', '{':'}', '"':'"', "'":"'" };
  if (!pairs[e.key]) return false;
  e.preventDefault();
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const open = e.key;
  const close = pairs[e.key];
  editor.value = editor.value.slice(0, start) + open + editor.value.slice(start, end) + close + editor.value.slice(end);
  editor.selectionStart = editor.selectionEnd = start + 1;
  markDirty();
  return true;
}

function maybeAutoIndent(editor, e){
  if (e.key !== 'Enter') return false;
  const start = editor.selectionStart;
  const before = editor.value.slice(0, start);
  const line = before.split('\n').pop() || '';
  const indent = (line.match(/^\s*/) || [''])[0] + (/[{[(]\s*$/.test(line) ? '  ' : '');
  e.preventDefault();
  editor.value = editor.value.slice(0, start) + '\n' + indent + editor.value.slice(editor.selectionEnd);
  editor.selectionStart = editor.selectionEnd = start + 1 + indent.length;
  markDirty();
  return true;
}

async function saveWorkspace(){
  if (!state.bridge) return setStatus('Bridge offline — check preload/main');
  persistActive();
  const payload = createSessionPayload();
  const out = await window.thoth.saveWorkspaceDialog(payload);
  if (!out?.ok) {
    if (!out?.canceled) setStatus(out?.error || 'Workspace save failed');
    return;
  }
  setStatus('Workspace saved');
}

async function openWorkspace(){
  if (!state.bridge) return setStatus('Bridge offline — check preload/main');
  const res = await window.thoth.openWorkspaceDialog();
  if (!res) return;
  if (!res.ok) return setStatus(res.error || 'Workspace open failed');
  await restoreSessionPayload(res.data || {}, true);
  setStatus('Workspace opened');
}

function createSessionPayload(){
  persistActive();
  return {
    version: '0.3.0',
    folder: state.folder,
    sidebarVisible: !els.app.classList.contains('sidebar-collapsed'),
    sidebarWidth: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) || 290,
    openFolders: Array.from(state.openFolders),
    recentFiles: state.recentFiles,
    markdownPreview: state.markdownPreview,
    tabs: state.tabs.map(t => ({ title:t.title, path:t.path, kind:t.kind, mode:t.mode, text:t.path?undefined:t.text, hex:t.path?undefined:t.hex, dirty:t.dirty })),
    activePath: activeTab()?.path || null,
    activeTitle: activeTab()?.title || null
  };
}

async function restoreSessionPayload(data, clearCurrent=false){
  if (clearCurrent) {
    state.tabs = [];
    state.active = null;
  }
  if (typeof data.sidebarVisible === 'boolean') toggleSidebar(data.sidebarVisible);
  if (data.sidebarWidth) {
    document.documentElement.style.setProperty('--sidebar-width', `${Math.min(Math.max(data.sidebarWidth, 190), 520)}px`);
    localStorage.setItem(LS.sidebarWidth, String(data.sidebarWidth));
  }
  if (Array.isArray(data.openFolders)) {
    state.openFolders = new Set(data.openFolders);
    localStorage.setItem(LS.openFolders, JSON.stringify(data.openFolders));
  }
  if (Array.isArray(data.recentFiles)) {
    state.recentFiles = data.recentFiles;
    localStorage.setItem(LS.recentFiles, JSON.stringify(state.recentFiles));
    renderRecentFiles();
  }
  state.markdownPreview = !!data.markdownPreview;
  if (data.folder) {
    state.folder = data.folder;
    const listed = await window.thoth.listDir(data.folder);
    if (listed?.ok) await renderRootTree(data.folder, listed.entries);
  }
  if (Array.isArray(data.tabs)) {
    for (const t of data.tabs) {
      if (t.path) await openFilePath(t.path);
      else addTab({ title:t.title, kind:t.kind, mode:t.mode, text:t.text || '', hex:t.hex || '' });
    }
  }
  if (data.activePath) {
    const tab = state.tabs.find(t => t.path === data.activePath);
    if (tab) switchTab(tab.id);
  }
  applyMarkdownPreview();
  renderTabs();
  showEditor(activeTab());
}

let sessionTimer = null;
function saveSessionDebounced(){
  clearTimeout(sessionTimer);
  sessionTimer = setTimeout(() => {
    try { localStorage.setItem(LS.session, JSON.stringify(createSessionPayload())); } catch {}
  }, 350);
}

async function recoverySave(){
  if (!state.bridge) return;
  const payload = createSessionPayload();
  payload.savedAt = Date.now();
  await window.thoth.saveRecovery(payload).catch(()=>{});
}

async function tryRecoveryRestore(){
  if (!state.bridge || !window.thoth.readRecovery) return false;
  const rec = await window.thoth.readRecovery().catch(()=>null);
  if (!rec?.ok || !rec.exists || !rec.data) return false;
  const dirty = (rec.data.tabs || []).some(t => t.dirty || (!t.path && (t.text || t.hex)));
  if (!dirty) return false;
  const yes = confirm('Recover previous unsaved ThothScript session?');
  if (yes) {
    await restoreSessionPayload(rec.data, true);
    setStatus('Recovered previous session');
  }
  await window.thoth.clearRecovery().catch(()=>{});
  return yes;
}

async function tryLocalSessionRestore(){
  const raw = localStorage.getItem(LS.session);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    const hasUnsaved = (data.tabs || []).some(t => !t.path && (t.text || t.hex));
    if (hasUnsaved && !confirm('Restore previous ThothScript session?')) return false;
    await restoreSessionPayload(data, true);
    setStatus('Session restored');
    return true;
  } catch {
    localStorage.removeItem(LS.session);
    return false;
  }
}

function markdownToHtml(md){
  let html = esc(md);
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => { const safe = /^(https?:|mailto:|#)/i.test(url) ? url : '#'; return `<a href="${safe}">${label}</a>`; });
  html = html.replace(/^\- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  html = html.replace(/\n{2,}/g, '</p><p>');
  html = '<p>' + html.replace(/\n/g, '<br>') + '</p>';
  html = html.replace(/<p>(<h[123]>.*?<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>');
  return html;
}

function applyMarkdownPreview(){
  els.editorShell.classList.toggle('preview-on', state.markdownPreview);
  els.markdownPreview.style.display = state.markdownPreview ? '' : 'none';
  updateMarkdownPreview();
  saveSessionDebounced();
}

function toggleMarkdownPreview(){
  state.markdownPreview = !state.markdownPreview;
  applyMarkdownPreview();
  setStatus(state.markdownPreview ? 'Markdown preview on' : 'Markdown preview off');
}

function updateMarkdownPreview(){
  if (!state.markdownPreview) return;
  const tab = activeTab();
  if (!tab || tab.kind === 'binary') {
    els.markdownPreview.innerHTML = '<div class="empty">Preview unavailable for this file.</div>';
    return;
  }
  persistActive();
  els.markdownPreview.innerHTML = markdownToHtml(tab.text || '');
}

const commands = [
  ['New Plain Text','Ctrl+N', newText],
  ['New Code File','Ctrl+Shift+N', newCode],
  ['New Markdown','', newMarkdown],
  ['Open File','Ctrl+O', openFile],
  ['Open Folder','Ctrl+K', openFolder],
  ['Save','Ctrl+S', () => save(false)],
  ['Save As','Ctrl+Shift+S', () => save(true)],
  ['Save Workspace','', saveWorkspace],
  ['Open Workspace','', openWorkspace],
  ['Toggle Explorer','Ctrl+B', () => toggleSidebar()],
  ['Workspace Search','Ctrl+Shift+F', () => showPanel('search', true)],
  ['Find in Current File','Ctrl+F', findInCurrent],
  ['Toggle Markdown Preview','Ctrl+Shift+V', toggleMarkdownPreview],
  ['Focus Mode','F11', toggleFocus],
  ['Export PDF','Ctrl+E', exportPdf],
  ['Print','Ctrl+P', printCurrent],
];

function openCommandPalette(){
  state.commandFiltered = commands;
  state.commandIndex = 0;
  els.commandOverlay.style.display = 'grid';
  els.commandInput.value = '';
  renderCommands();
  setTimeout(()=>els.commandInput.focus(),0);
}

function closeCommandPalette(){
  els.commandOverlay.style.display = 'none';
}

function renderCommands(){
  els.commandList.innerHTML = '';
  state.commandFiltered.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'commandItem' + (i === state.commandIndex ? ' active' : '');
    div.innerHTML = `<span>${esc(c[0])}</span><span class="commandHint">${esc(c[1] || '')}</span>`;
    div.onclick = () => runCommand(i);
    els.commandList.appendChild(div);
  });
}

function filterCommands(){
  const q = els.commandInput.value.toLowerCase().trim();
  state.commandFiltered = commands.filter(c => c[0].toLowerCase().includes(q));
  state.commandIndex = 0;
  renderCommands();
}

function runCommand(i=state.commandIndex){
  const cmd = state.commandFiltered[i];
  if (!cmd) return;
  closeCommandPalette();
  cmd[2]();
}

function wire(){
  $('btnNewText').onclick = newText;
  $('btnNewCode').onclick = newCode;
  $('btnNewMarkdown').onclick = newMarkdown;
  $('btnOpenFile').onclick = openFile;
  $('btnOpenFolder').onclick = openFolder;
  $('btnSave').onclick = () => save(false);
  $('btnSaveAs').onclick = () => save(true);
  $('btnExportPdf').onclick = exportPdf;
  $('btnPrint').onclick = printCurrent;
  $('btnToggleMode').onclick = () => {
    const tab = activeTab();
    setMode(tab?.mode === 'code' ? 'plain' : 'code');
  };
  $('btnFocus').onclick = toggleFocus;
  $('btnCommand').onclick = openCommandPalette;
  $('btnMarkdownPreview').onclick = toggleMarkdownPreview;
  $('focusEscape').onclick = () => toggleFocus(false);

  $('railExplorer').onclick = () => showPanel('explorer');
  $('railSearch').onclick = () => showPanel('search');
  $('railDocs').onclick = newMarkdown;
  $('railCommand').onclick = openCommandPalette;
  $('railFocus').onclick = toggleFocus;
  $('railInfo').onclick = () => setStatus('ThothScript v0.3 Pro Workspace');
  $('btnRunSearch').onclick = () => workspaceSearch(false);
  $('btnRunReplace').onclick = () => workspaceSearch(true);
  els.searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') workspaceSearch(false); });

  [els.text, els.code, els.hex].forEach(ed => {
    ed.addEventListener('input', markDirty);
    ed.addEventListener('click', updateCursor);
    ed.addEventListener('keyup', updateCursor);
    ed.addEventListener('scroll', () => { els.lineNums.scrollTop = ed.scrollTop; });
    ed.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = ed.selectionStart;
        const end = ed.selectionEnd;
        ed.value = ed.value.substring(0, start) + '  ' + ed.value.substring(end);
        ed.selectionStart = ed.selectionEnd = start + 2;
        markDirty();
        return;
      }
      if (ed === els.code && maybeAutoPair(ed, e)) return;
      if (ed === els.code && maybeAutoIndent(ed, e)) return;
    });
  });

  document.querySelectorAll('.iconbtn,.railbtn,.smallbtn').forEach(btn => {
    btn.addEventListener('mouseenter', () => setHint(btn.title || 'Ready'));
    btn.addEventListener('mouseleave', () => setHint('Ready'));
  });

  window.thoth?.onMenu?.('menu:newText', newText);
  window.thoth?.onMenu?.('menu:newCode', newCode);
  window.thoth?.onMenu?.('menu:newMarkdown', newMarkdown);
  window.thoth?.onMenu?.('menu:openFile', openFile);
  window.thoth?.onMenu?.('menu:openFolder', openFolder);
  window.thoth?.onMenu?.('menu:save', () => save(false));
  window.thoth?.onMenu?.('menu:saveAs', () => save(true));
  window.thoth?.onMenu?.('menu:saveWorkspace', saveWorkspace);
  window.thoth?.onMenu?.('menu:openWorkspace', openWorkspace);
  window.thoth?.onMenu?.('menu:exportPdf', exportPdf);
  window.thoth?.onMenu?.('menu:print', printCurrent);
  window.thoth?.onMenu?.('menu:find', findInCurrent);
  window.thoth?.onMenu?.('menu:workspaceSearch', () => showPanel('search', true));
  window.thoth?.onMenu?.('menu:commandPalette', openCommandPalette);
  window.thoth?.onMenu?.('menu:toggleSidebar', () => toggleSidebar());
  window.thoth?.onMenu?.('menu:focusMode', toggleFocus);
  window.thoth?.onMenu?.('menu:markdownPreview', toggleMarkdownPreview);
  window.thoth?.onMenu?.('menu:toggleMode', () => {
    const tab = activeTab();
    setMode(tab?.mode === 'code' ? 'plain' : 'code');
  });

  window.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'b') { e.preventDefault(); toggleSidebar(); }
    if (ctrl && e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); openCommandPalette(); }
    if (ctrl && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); showPanel('search', true); }
    if (ctrl && e.shiftKey && e.key.toLowerCase() === 'v') { e.preventDefault(); toggleMarkdownPreview(); }
    if (e.key === 'F11') { e.preventDefault(); toggleFocus(); }
    if (e.key === 'Escape' && els.app.classList.contains('focus-mode')) { e.preventDefault(); toggleFocus(false); }
    if (e.key === 'Escape' && els.commandOverlay.style.display !== 'none') { e.preventDefault(); closeCommandPalette(); }
  });

  els.commandOverlay.addEventListener('click', (e) => { if (e.target === els.commandOverlay) closeCommandPalette(); });
  els.commandInput.addEventListener('input', filterCommands);
  els.commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCommandPalette();
    if (e.key === 'ArrowDown') { e.preventDefault(); state.commandIndex = Math.min(state.commandIndex + 1, state.commandFiltered.length - 1); renderCommands(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); state.commandIndex = Math.max(state.commandIndex - 1, 0); renderCommands(); }
    if (e.key === 'Enter') { e.preventDefault(); runCommand(); }
  });

  wireResizer();
}

async function boot(){
  applySavedLayout();
  wire();
  renderRecentFiles();
  if (window.thoth?.ping) {
    const ping = await window.thoth.ping().catch(() => null);
    state.bridge = !!ping?.ok;
  }
  setStatus(state.bridge ? 'Ready' : 'Bridge offline');

  const recovered = await tryRecoveryRestore();
  if (!recovered) {
    const restored = await tryLocalSessionRestore();
    if (!restored) newText();
  }
  setInterval(recoverySave, 30000);
  setInterval(saveSessionDebounced, 10000);
}

window.addEventListener('beforeunload', () => {
  try { localStorage.setItem(LS.session, JSON.stringify(createSessionPayload())); } catch {}
});

boot();
