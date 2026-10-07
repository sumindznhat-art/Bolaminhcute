/* ============================================================
   APP.JS — LOGIC CHÍNH
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const s = getSession();
  if (s && s.user) {
    enterApp();
  } else {
    const ls = document.getElementById('login-screen'); if (ls) ls.style.display = '';
    const app = document.getElementById('app'); if (app) app.style.display = 'none';
  }

  ['loginEmail','loginPass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });
  ['regName','regEmail','regPass','regPass2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
  });

  startClock();
});

/* ==================== VÀO APP ==================== */
async function enterApp() {
  const ls = document.getElementById('login-screen'); if (ls) ls.style.display = 'none';
  const app = document.getElementById('app'); if (app) app.style.display = 'flex';

  const s = getSession();
  if (!s) { doLogout(); return; }
  let u = s.user;

  try {
    const res = await api('get_user', { email: s.email, password: s.password });
    if (res && res.success && res.user) {
      u = res.user;
      if (s.email.toLowerCase() === ADMIN_EMAIL) u.is_admin = 1;
      refreshUser(u);
    }
  } catch (e) {}

  if (!u) { doLogout(); return; }

  const isAdmin = (u.email === ADMIN_EMAIL) || (u.is_admin == 1);
  const float = document.getElementById('adminFloat');
  const diAdm = document.getElementById('diAdmin');
  if (float) float.style.display = isAdmin ? 'flex' : 'none';
  if (diAdm) diAdm.style.display = isAdmin ? '' : 'none';

  const av = u.avatar || getAvatarFromStorage() || DEFAULT_AVATAR;
  ['hdrAvatar', 'profAvatar', 'drawerAvatar', 'loginAvatarImg'].forEach(id => {
    const el = document.getElementById(id); if (el) el.src = av;
  });

  const dn = document.getElementById('drawerName'); if (dn) dn.textContent = u.name || 'User';
  const de = document.getElementById('drawerEmail'); if (de) de.textContent = u.email;

  if (isAdmin) {
    try {
      const res = await api('deposit_pending', { email: s.email, password: s.password });
      const cnt = res && res.success ? (res.deposits || []).length : 0;
      const b = document.getElementById('pendBadge');
      if (b) { b.textContent = cnt; b.style.display = cnt ? 'inline-block' : 'none'; }
    } catch (e) {}
  }

  buildBankInfo();
  buildPackages();
  buildTools();
  renderAll();
  showPage('home');
}

/* ==================== ĐIỀU HƯỚNG ==================== */
function showPage(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  const el = document.getElementById('page-' + p);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === p));
  const c = document.getElementById('appContent');
  if (c) c.scrollTop = 0;
  if (p === 'deposit' || p === 'vip' || p === 'profile') renderAll();
}

/* ==================== ĐỒNG HỒ ==================== */
function startClock() {
  setInterval(() => {
    const d = new Date();
    const t = d.toLocaleTimeString('vi-VN', { hour12: false });
    const dt = d.toLocaleDateString('vi-VN');
    const a = document.getElementById('liveClock'); if (a) a.textContent = t;
    const b = document.getElementById('liveDate'); if (b) b.textContent = dt;
  }, 1000);
}

/* ==================== RENDER ==================== */
function renderAll() {
  const s = getSession();
  if (!s) return;
  const u = s.user;
  if (!u) return;

  const bal = fmt(u.balance || 0);
  ['hdrBalance','curBalance','depBalance','vipBalance','profBalance'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = bal;
  });

  const pn = document.getElementById('profName');       if (pn) pn.textContent = u.name || 'User';
  const pr = document.getElementById('profRole');       if (pr) pr.textContent = (u.is_admin == 1 || u.email === ADMIN_EMAIL) ? 'ADMIN' : 'THÀNH VIÊN';
  const pj = document.getElementById('profJoined');     if (pj) pj.textContent = u.created_at ? new Date(Number(u.created_at)).toLocaleDateString('vi-VN') : '—';
  const pl = document.getElementById('profLastLogin');  if (pl) pl.textContent = u.last_login ? new Date(Number(u.last_login)).toLocaleString('vi-VN') : '—';
  const pi = document.getElementById('profIP');         if (pi) pi.textContent = u.ip || '—';

  const hasVip = Number(u.key_expiry) > Date.now();
  const cp = document.getElementById('curPackage');     if (cp) cp.textContent = hasVip ? 'VIP' : 'Chưa có';
  const ve = document.getElementById('vipExpiry');      if (ve) ve.textContent = hasVip ? new Date(Number(u.key_expiry)).toLocaleString('vi-VN') : 'Chưa kích hoạt';
  const ds = document.getElementById('depStatus');      if (ds) ds.textContent = hasVip ? 'VIP đến ' + new Date(Number(u.key_expiry)).toLocaleDateString('vi-VN') : 'Chưa có key';
}

/* ==================== BANK INFO ==================== */
function buildBankInfo() {
  const el = document.getElementById('bankInfo');
  if (!el || !window.CONFIG || !window.CONFIG.bank) return;
  const b = window.CONFIG.bank;
  el.innerHTML = `
    <div class="section-title">Thông tin chuyển khoản</div>
    <div class="pay-method" style="cursor:default">
      <div class="pay-icon"><i class="fa-solid fa-building-columns"></i></div>
      <div class="pay-info">
        <div class="name">${b.name}</div>
        <div class="desc">STK: <b>${b.account}</b> — ${b.owner}</div>
      </div>
    </div>
  `;
}

/* ==================== PACKAGES ==================== */
function buildPackages() {
  const el = document.getElementById('pkgList');
  if (!el || !window.CONFIG || !window.CONFIG.packages) return;
  el.innerHTML = window.CONFIG.packages.map(p => `
    <div class="pay-method" onclick="buyPackage('${p.id}')">
      <div class="pay-icon yellow"><i class="fa-solid fa-crown"></i></div>
      <div class="pay-info">
        <div class="name">${p.name}</div>
        <div class="desc">${p.days} ngày • <b>${fmt(p.price)}</b></div>
      </div>
      <i class="fa-solid fa-chevron-right pay-arrow"></i>
    </div>
  `).join('');
}

async function buyPackage(id) {
  const pkg = (window.CONFIG.packages || []).find(x => x.id === id);
  if (!pkg) return;
  const s = getSession();
  if (!s) return alert('Vui lòng đăng nhập lại!');
  const u = s.user;

  if ((u.balance || 0) < pkg.price) {
    alert('Số dư không đủ! Vui lòng nạp thêm.');
    showPage('deposit');
    return;
  }
  if (!confirm('Mua ' + pkg.name + ' với giá ' + fmt(pkg.price) + '?')) return;

  const res = await api('buy_package', { email: s.email, password: s.password, days: pkg.days, price: pkg.price });
  if (res && res.success) {
    alert('✅ Mua thành công!');
    await apiGetUser();
    renderAll();
  } else {
    alert('❌ ' + ((res && res.error) || 'Lỗi mua gói'));
  }
}

/* ==================== TOOLS ==================== */
function buildTools() {
  const el = document.getElementById('toolList');
  if (!el || !window.CONFIG || !window.CONFIG.tools) return;
  const tc = document.getElementById('toolCount'); if (tc) tc.textContent = window.CONFIG.tools.length;
  el.innerHTML = window.CONFIG.tools.map(t => `
    <div class="pay-method" onclick="openTool('${t.id}')">
      <div class="pay-icon purple"><i class="fa-solid fa-cube"></i></div>
      <div class="pay-info"><div class="name">${t.name}</div><div class="desc">${t.cat}</div></div>
      <i class="fa-solid fa-chevron-right pay-arrow"></i>
    </div>
  `).join('');
}

function openTool(id) {
  const t = (window.CONFIG.tools || []).find(x => x.id === id);
  if (!t) return;
  const s = getSession();
  if (!s) return;
  const u = s.user;
  const hasVip = Number(u.key_expiry) > Date.now() || u.is_admin == 1 || u.email === ADMIN_EMAIL;
  if (!hasVip) {
    alert('Cần kích hoạt VIP để dùng tool!');
    openKeyModal();
    return;
  }
  const frame = document.getElementById('gameFrame');
  if (frame) frame.src = t.url;
  const gsName = document.getElementById('gsName');
  if (gsName) gsName.textContent = t.name;
  const gs = document.getElementById('game-screen');
  if (gs) gs.classList.add('show');
}

function closeGame() {
  const gs = document.getElementById('game-screen');
  if (gs) gs.classList.remove('show');
  const frame = document.getElementById('gameFrame');
  if (frame) frame.src = 'about:blank';
}

/* ==================== NẠP TIỀN ==================== */
function openDepositModal() {
  const a = document.getElementById('depAmount'); if (a) a.value = '';
  const n = document.getElementById('depNote');   if (n) n.value = '';
  openModal('depositModal');
}

/* ==================== LỊCH SỬ ==================== */
async function openHistoryDeposit() {
  const s = getSession();
  if (!s) return;
  const res = await api('history', { email: s.email, password: s.password });
  const hist = (res && res.success) ? (res.history || []) : [];
  const deps = hist.filter(h => h.type === 'deposit');

  let html = deps.length ? '' : '<p style="text-align:center;color:#94a3b8">Chưa có giao dịch</p>';
  deps.forEach(d => {
    const amt = Number(d.amount) || 0;
    const color = amt > 0 ? '#16a34a' : '#dc2626';
    const sign = amt > 0 ? '+' : '';
    html += `<div style="border-left:3px solid ${color};padding:8px;margin-bottom:6px;background:#f8fafc;border-radius:6px">
      <div style="font-weight:700;color:${color}">${sign}${fmt(amt)}</div>
      <div style="font-size:12px;color:#64748b">${esc(d.note || '')}</div>
      <div style="font-size:11px;color:#94a3b8">${new Date(Number(d.at)).toLocaleString('vi-VN')}</div>
    </div>`;
  });
  const t = document.getElementById('histTitle'); if (t) t.textContent = 'Lịch sử nạp tiền';
  const c = document.getElementById('histContent'); if (c) c.innerHTML = html;
  openModal('historyModal');
}

async function openHistoryKey() {
  const s = getSession();
  if (!s) return;
  const res = await api('history', { email: s.email, password: s.password });
  const hist = (res && res.success) ? (res.history || []) : [];
  const keys = hist.filter(h => h.type === 'key' || h.type === 'buy' || h.type === 'auto-buy');

  let html = keys.length ? '' : '<p style="text-align:center;color:#94a3b8">Chưa có lịch sử</p>';
  keys.forEach(h => {
    html += `<div style="border-left:3px solid #8b5cf6;padding:8px;margin-bottom:6px;background:#f8fafc;border-radius:6px">
      <div style="font-weight:700">${esc(h.note || h.type)}</div>
      <div style="font-size:12px;color:#64748b">${h.amount ? (h.amount > 0 ? '+' : '') + fmt(h.amount) : ''}</div>
      <div style="font-size:11px;color:#94a3b8">${new Date(Number(h.at)).toLocaleString('vi-VN')}</div>
    </div>`;
  });
  const t = document.getElementById('histTitle'); if (t) t.textContent = 'Lịch sử mua key';
  const c = document.getElementById('histContent'); if (c) c.innerHTML = html;
  openModal('historyModal');
}

/* ==================== MODAL HELPERS ==================== */
function openModal(id)  { const el = document.getElementById(id); if (el) el.classList.add('show'); }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('show'); }

function openKeyModal() {
  const ki = document.getElementById('keyInput'); if (ki) ki.value = '';
  const ke = document.getElementById('keyErr');   if (ke) ke.textContent = '';
  openModal('keyModal');
}

function openAvatarModal() {
  const st = document.getElementById('avStatus'); if (st) st.textContent = '';
  const inp = document.getElementById('avBase64Input'); if (inp) inp.value = '';
  openModal('avatarModal');
}

function saveAvatar() {
  const val = document.getElementById('avBase64Input').value.trim();
  const status = document.getElementById('avStatus');
  if (!val) { if (status) status.textContent = 'Chưa có dữ liệu'; return; }
  const src = val.startsWith('data:') ? val : 'data:image/png;base64,' + val;
  setAvatarToStorage(src);
  applyAvatarEverywhere(src);
  if (status) status.textContent = '✅ Đã lưu';
  setTimeout(() => closeModal('avatarModal'), 800);
}

function resetAvatar() {
  setAvatarToStorage('');
  applyAvatarEverywhere(DEFAULT_AVATAR);
  const status = document.getElementById('avStatus');
  if (status) status.textContent = '✅ Đã reset';
}

function defaultAvatar() { return DEFAULT_AVATAR; }

/* ==================== DRAWER ==================== */
function openDrawer() {
  const d = document.getElementById('drawer'); if (d) d.classList.add('show');
  const m = document.getElementById('drawerMask'); if (m) m.classList.add('show');
}
function closeDrawer() {
  const d = document.getElementById('drawer'); if (d) d.classList.remove('show');
  const m = document.getElementById('drawerMask'); if (m) m.classList.remove('show');
}

/* ==================== MUSIC ==================== */
let _musicOn = false;
function toggleMusic() {
  _musicOn = !_musicOn;
  const btn = document.getElementById('musicBtn');
  if (btn) btn.innerHTML = _musicOn
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
}

/* ==================== EXPOSE ==================== */
window.enterApp = enterApp;
window.showPage = showPage;
window.renderAll = renderAll;
window.openDepositModal = openDepositModal;
window.openHistoryDeposit = openHistoryDeposit;
window.openHistoryKey = openHistoryKey;
window.openKeyModal = openKeyModal;
window.openAvatarModal = openAvatarModal;
window.saveAvatar = saveAvatar;
window.resetAvatar = resetAvatar;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.toggleMusic = toggleMusic;
window.openTool = openTool;
window.closeGame = closeGame;
window.buyPackage = buyPackage;
window.openModal = openModal;
window.closeModal = closeModal;
window.defaultAvatar = defaultAvatar;
