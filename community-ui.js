(() => {
  const MODAL_ID = 'thothCommunityModal';

  function dirtyTabs() {
    return [...document.querySelectorAll('.tab')].filter(tab => {
      const title = tab.querySelector('.tabtitle')?.textContent || '';
      return title.includes('•');
    });
  }

  function installDirtyTabGuard() {
    document.addEventListener('click', (event) => {
      const close = event.target.closest?.('.tabclose');
      if (!close) return;
      const tab = close.closest('.tab');
      const title = tab?.querySelector('.tabtitle')?.textContent || '';
      if (!title.includes('•')) return;

      const name = title.replace('•', '').trim() || 'this file';
      const ok = window.confirm(`Close ${name} and discard unsaved changes?`);
      if (!ok) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    window.addEventListener('beforeunload', (event) => {
      if (!dirtyTabs().length) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.cssText = 'position:fixed;inset:0;display:none;z-index:9999;background:rgba(0,0,0,.72);align-items:center;justify-content:center;padding:24px;';
    modal.innerHTML = `
      <div style="width:min(720px,95vw);max-height:85vh;overflow:auto;background:#0b111a;border:1px solid #26384d;border-radius:12px;padding:22px;box-shadow:0 20px 70px rgba(0,0,0,.5);color:#d8e7f5;font-family:system-ui,sans-serif;">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:16px;">
          <div><div style="font-size:22px;font-weight:700;">ThothScript Diagnostics</div><div style="opacity:.7;margin-top:3px;">Community development build</div></div>
          <button id="thothCommunityClose" style="background:#131f2d;color:#d8e7f5;border:1px solid #31465e;border-radius:8px;padding:8px 12px;cursor:pointer;">Close</button>
        </div>
        <div id="thothCommunityBody" style="display:grid;gap:10px;font-family:ui-monospace,Consolas,monospace;font-size:13px;"></div>
        <p style="opacity:.72;line-height:1.5;margin-top:18px;">If you report a bug, include these diagnostics plus the exact steps that triggered the problem. Do not include private file contents.</p>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#thothCommunityClose').onclick = () => { modal.style.display = 'none'; };
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
    return modal;
  }

  async function openDiagnostics() {
    const modal = ensureModal();
    const body = modal.querySelector('#thothCommunityBody');
    const tabs = [...document.querySelectorAll('.tab')];
    const dirty = dirtyTabs();
    let bridge = 'offline';
    let ping = null;
    try {
      ping = await window.thoth?.ping?.();
      bridge = ping?.ok ? 'online' : 'unavailable';
    } catch (error) {
      bridge = `error: ${error?.message || error}`;
    }

    const rows = [
      ['App', ping?.app || 'ThothScript'],
      ['Bridge', bridge],
      ['Open tabs', String(tabs.length)],
      ['Unsaved tabs', String(dirty.length)],
      ['Sidebar', document.body.classList.contains('sidebar-hidden') ? 'collapsed' : 'available'],
      ['Markdown preview', document.getElementById('markdownPreview')?.style.display === 'none' ? 'closed' : 'open'],
      ['User agent', navigator.userAgent],
      ['Platform', navigator.platform || 'unknown']
    ];

    body.innerHTML = rows.map(([k, v]) => `<div style="display:grid;grid-template-columns:150px 1fr;gap:12px;border-bottom:1px solid #1b2b3d;padding:8px 0;"><strong>${escapeHtml(k)}</strong><span style="word-break:break-word;">${escapeHtml(v)}</span></div>`).join('');
    modal.style.display = 'flex';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function installDiagnostics() {
    const info = document.getElementById('railInfo');
    if (info) {
      info.title = 'About / Diagnostics';
      info.addEventListener('click', openDiagnostics);
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F1') {
        event.preventDefault();
        openDiagnostics();
      }
    });
  }

  installDirtyTabGuard();
  installDiagnostics();
})();
