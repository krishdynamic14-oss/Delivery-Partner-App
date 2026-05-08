// Dynamic Bazar — Shared App Logic v2.5

// ── AUTH ──────────────────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem('db_user')) || { name: 'Admin', role: 'Admin', initials: 'A' }; } catch { return { name: 'Admin', role: 'Admin', initials: 'A' }; }
}
function setUser(u) { localStorage.setItem('db_user', JSON.stringify(u)); }
function logout() {
  showToast('Signed out. See you soon!', 'info');
  setTimeout(() => { localStorage.removeItem('db_user'); location.href = 'login.html'; }, 900);
}

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3200, undoFn = null) {
  const old = document.getElementById('db-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'db-toast';
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${msg}</span>` + (undoFn ? `<button class="toast-undo" id="toast-undo-btn">Undo</button>` : '');
  document.body.appendChild(t);
  if (undoFn) document.getElementById('toast-undo-btn').onclick = () => { t.remove(); undoFn(); };
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('toast-show')));
  setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 350); }, duration);
}

// ── BOTTOM SHEET ──────────────────────────────────────────
function openSheet(id) {
  const s = document.getElementById(id), o = document.getElementById(id + '-ov');
  if (!s) return;
  s.style.display = 'flex'; if (o) o.style.display = 'block';
  requestAnimationFrame(() => requestAnimationFrame(() => { s.classList.add('sheet-open'); if (o) o.classList.add('overlay-show'); }));
  document.body.style.overflow = 'hidden';
}
function closeSheet(id) {
  const s = document.getElementById(id), o = document.getElementById(id + '-ov');
  if (s) s.classList.remove('sheet-open'); if (o) o.classList.remove('overlay-show');
  document.body.style.overflow = '';
  setTimeout(() => { if (s) s.style.display = 'none'; if (o) o.style.display = 'none'; }, 350);
}

// ── PROFILE DRAWER ────────────────────────────────────────
function openProfile() {
  const d = document.getElementById('profile-drawer'), o = document.getElementById('drawer-ov');
  if (!d) return;
  const u = getUser();
  const el = document.getElementById('drawer-initials');
  const nm = document.getElementById('drawer-name');
  const rl = document.getElementById('drawer-role');
  if (el) el.textContent = u.initials || u.name[0];
  if (nm) nm.textContent = u.name;
  if (rl) rl.textContent = u.role + ' · Dynamic Bazar';
  d.style.display = 'flex'; if (o) o.style.display = 'block';
  requestAnimationFrame(() => requestAnimationFrame(() => { d.classList.add('sheet-open'); if (o) o.classList.add('overlay-show'); }));
  document.body.style.overflow = 'hidden';
}
function closeProfile() { closeSheet('profile-drawer'); document.getElementById('drawer-ov').style.display='none'; }

// ── SWIPE ACTIONS ─────────────────────────────────────────
function initSwipeCard(cardEl, onSwipeLeft, onSwipeRight) {
  const inner = cardEl.querySelector('.order-card-inner');
  if (!inner) return;
  let startX = 0, startY = 0, dragging = false, moved = false;
  inner.addEventListener('touchstart', e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; dragging = true; moved = false; }, { passive: true });
  inner.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (!moved && Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }
    moved = true;
    const clamped = Math.max(-80, Math.min(80, dx));
    inner.style.transition = 'none';
    inner.style.transform = `translateX(${clamped}px)`;
  }, { passive: true });
  inner.addEventListener('touchend', e => {
    if (!dragging) return; dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    inner.style.transition = 'transform .25s';
    inner.style.transform = '';
    if (dx < -64 && onSwipeLeft) onSwipeLeft(cardEl);
    if (dx > 64 && onSwipeRight) onSwipeRight(cardEl);
  });
  // Also support click
  inner.style.cursor = 'pointer';
}

// ── HEADER USER INIT ─────────────────────────────────────
function initHeader() {
  const u = getUser();
  document.querySelectorAll('.avatar').forEach(a => { if (!a.dataset.static) a.textContent = u.initials || u.name[0]; });
  document.querySelectorAll('.header-title[data-user-name]').forEach(el => el.textContent = u.name);
}

document.addEventListener('DOMContentLoaded', initHeader);
