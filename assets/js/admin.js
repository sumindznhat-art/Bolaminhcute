/* ============================================================
   ADMIN.JS — QUẢN TRỊ: DUYỆT TIỀN, USERS, KEYS, LỊCH SỬ
   ============================================================ */

async function openAdmin() {
  const s = getSession();
  if (!s) { alert('Chưa đăng nhập'); return; }
  const u = s.user;
  const isAdmin = (s.email === ADMIN_EMAIL) || (u && u.is_admin == 1);
  if (!isAdmin) { alert('Không có quyền Admin!'); return; }

  const uv = document.getElementById('adminUsersView');
  const pv = document.getElementById('adminPendingView');
  const kv = document.getElementById('adminKeysView');
  const hv = document.getElementById('adminHistoryView');
  if (uv) uv.innerHTML = '<p style="text-align:center;color:#94a3b8">Đang tải...</p>';
  if (pv) pv.innerHTML = '';
  if (kv) kv.innerHTML = '';
  if (hv) hv.innerHTML = '';

  openModal('adminPanel');

  await renderAdminPending();
  await renderAdminUsers();
  await renderAdminKeys();
  await renderAdminHistory();
}

function switchAdminTab(t) {
  document.querySelectorAll('.admin-tab').forEach(x => x.classList.toggle('active', x.dataset.atab === t));
  const map = { users: 'adminUsersView', pending: 'adminPendingView', keys: 'adminKeysView', history: 'adminHistoryView' };
  Object.values(map).forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  const target = document.getElementById(map[t]);
  if (target) target.style.display = '';
}

/* ==================== DANH SÁCH USER ==================== */
async function renderAdminUsers() {
  const s = getSession();
  if (!s) return;
  const el = document.getElementById('adminUsersView');
  if (!el) return;

  const res = await api('user_list', { email: s.email, password: s.password });
  const list = (res && res.success) ? (res.users || []) : [];

  if (!list.length) { el.innerHTML = '<p style="text-align:center;color:#94a3b8">Không có user</p>'; return; }

  let html = `<p style="text-align:center;font-size:12px;color:#64748b;margin-bottom:8px">Tổng: <b>${list.length}</b> user</p>`;
  list.forEach(u => {
    const exp = u.key_expiry ? new Date(Number(u.key_expiry)).toLocaleDateString('vi-VN') : '—';
    const isAdm = u.is_admin == 1;
    html += `
      <div class="adm-row" style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;margin-bottom:8px;background:#fff">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <b>${esc(u.name || '')}</b>
          <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:${isAdm?'#fee2e2':'#dbeafe'};color:${isAdm?'#dc2626':'#0284c7'};font-weight:700">${isAdm?'ADMIN':'USER'}</span>
        </div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">📧 ${esc(u.email)}</div>
        <div style="font-size:12px;color:#64748b">🌐 IP: <code>${esc(u.ip||'—')}</code></div>
        <div style="font-size:12px;color:#64748b">💰 Số dư: <b style="color:#16a34a">${fmt(u.balance||0)}</b></div>
        <div style="font-size:12px;color:#64748b">⏰ Hạn VIP: ${exp}</div>
      </div>`;
  });
  el.innerHTML = html;
}

/* ==================== DUYỆT TIỀN ==================== */
async function renderAdminPending() {
  const s = getSession();
  if (!s) return;
  const el = document.getElementById('adminPendingView');
  if (!el) return;

  const res = await api('deposit_pending', { email: s.email, password: s.password });
  const deps = (res && res.success) ? (res.deposits || []) : [];

  if (!deps.length) {
    el.innerHTML = '<p style="text-align:center;color:#94a3b8">Không có yêu cầu nào</p>';
    const b = document.getElementById('pendBadge');
    if (b) b.style.display = 'none';
    return;
  }

  let html = `<p style="text-align:center;font-size:12px;color:#64748b;margin-bottom:8px">Có <b style="color:#dc2626">${deps.length}</b> yêu cầu chờ duyệt</p>`;
  deps.forEach(d => {
    const time = new Date(Number(d.created_at)).toLocaleString('vi-VN');
    html += `
      <div class="adm-row" style="border:2px solid #fde68a;border-radius:10px;padding:10px;margin-bottom:8px;background:#fffbeb">
        <div><b>${esc(d.email)}</b>${d.user_name ? ' — ' + esc(d.user_name) : ''}</div>
        <div style="font-size:14px;color:#dc2626;font-weight:800;margin:4px 0">💵 ${fmt(d.amount)}</div>
        <div style="font-size:12px;color:#64748b">🌐 IP: <code>${esc(d.ip||'—')}</code></div>
        <div style="font-size:12px;color:#64748b">📝 ${esc(d.note||'(không có ghi chú)')}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px">🕐 ${time}</div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="adm-btn" style="background:linear-gradient(135deg,#22c55e,#16a34a);flex:1" onclick="approveDeposit('${d.id}')"><i class="fa-solid fa-check"></i> DUYỆT</button>
          <button class="adm-btn" style="background:linear-gradient(135deg,#ef4444,#dc2626);flex:1" onclick="rejectDeposit('${d.id}')"><i class="fa-solid fa-xmark"></i> TỪ CHỐI</button>
        </div>
      </div>`;
  });
  el.innerHTML = html;

  const badge = document.getElementById('pendBadge');
  if (badge) { badge.textContent = deps.length; badge.style.display = deps.length ? 'inline-block' : 'none'; }
}

async function approveDeposit(id) {
  if (!confirm('Xác nhận ĐÃ NHẬN ĐƯỢC TIỀN và duyệt?')) return;
  const s = getSession();
  if (!s) return;

  const res = await api('deposit_approve', { email: s.email, password: s.password, id });
  if (res && res.success) {
    alert('✅ Đã duyệt! Số dư mới: ' + fmt(res.new_balance));
    await renderAdminPending();
    await renderAdminUsers();
    await renderAdminHistory();
    if (typeof renderAll === 'function') renderAll();
  } else {
    alert('❌ ' + ((res && res.error) || 'Lỗi duyệt tiền'));
  }
}

async function rejectDeposit(id) {
  const reason = prompt('Lý do từ chối:', 'Không hợp lệ');
  if (reason === null) return;
  const s = getSession();
  if (!s) return;

  const res = await api('deposit_reject', { email: s.email, password: s.password, id, reason: reason || 'Không hợp lệ' });
  if (res && res.success) {
    alert('❌ Đã từ chối');
    await renderAdminPending();
    await renderAdminHistory();
  } else {
    alert('❌ ' + ((res && res.error) || 'Lỗi từ chối'));
  }
}

/* ==================== KEYS ==================== */
async function renderAdminKeys() {
  const s = getSession();
  if (!s) return;
  const el = document.getElementById('adminKeysView');
  if (!el) return;

  const res = await api('key_list', { email: s.email, password: s.password });
  const keys = (res && res.success) ? (res.keys || []) : [];

  let html = `<p style="text-align:center;font-size:12px;color:#64748b;margin-bottom:8px">Tổng: <b>${keys.length}</b> key</p>`;
  if (!keys.length) {
    html += '<p style="text-align:center;color:#94a3b8">Chưa có key nào</p>';
  } else {
    keys.forEach(k => {
      const used = k.used == 1 ? '🔴 Đã dùng' : '🟢 Chưa dùng';
      html += `
        <div class="adm-row" style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;margin-bottom:8px;background:#fff">
          <div><b style="font-family:monospace;color:#0284c7">${esc(k.code)}</b></div>
          <div style="font-size:12px;color:#64748b">⏱ ${k.days} ngày • ${used}</div>
          ${k.used_by ? `<div style="font-size:12px;color:#64748b">👤 Dùng bởi: ${esc(k.used_by)}</div>` : ''}
          ${k.used_at ? `<div style="font-size:11px;color:#94a3b8">🕐 ${new Date(Number(k.used_at)).toLocaleString('vi-VN')}</div>` : ''}
        </div>`;
    });
  }
  el.innerHTML = html;
}

/* ==================== LỊCH SỬ ==================== */
async function renderAdminHistory() {
  const s = getSession();
  if (!s) return;
  const el = document.getElementById('adminHistoryView');
  if (!el) return;

  const res = await api('history', { email: s.email, password: s.password });
  const hist = (res && res.success) ? (res.history || []) : [];

  if (!hist.length) { el.innerHTML = '<p style="text-align:center;color:#94a3b8">Chưa có giao dịch</p>'; return; }

  let html = '';
  hist.slice(0, 100).forEach(h => {
    const amt = Number(h.amount) || 0;
    const color = amt > 0 ? '#16a34a' : (amt < 0 ? '#dc2626' : '#3b5bfd');
    const sign = amt > 0 ? '+' : '';
    const time = new Date(Number(h.at)).toLocaleString('vi-VN');
    html += `<div class="adm-row" style="border-left:3px solid ${color};padding:8px;margin-bottom:6px;background:#f8fafc">
      <div><b>${esc((h.type || '').toUpperCase())}</b> — ${esc(h.note || '')}</div>
      ${amt ? `<div style="font-size:12px">Số tiền: <b style="color:${color}">${sign}${fmt(amt)}</b></div>` : ''}
      <div style="font-size:11px;color:#94a3b8">${time}</div>
    </div>`;
  });
  el.innerHTML = html;
}

/* ==================== EXPOSE ==================== */
window.openAdmin = openAdmin;
window.switchAdminTab = switchAdminTab;
window.approveDeposit = approveDeposit;
window.rejectDeposit = rejectDeposit;
window.renderAdminUsers = renderAdminUsers;
window.renderAdminPending = renderAdminPending;
window.renderAdminKeys = renderAdminKeys;
window.renderAdminHistory = renderAdminHistory;
