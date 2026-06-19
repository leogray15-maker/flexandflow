// Flex & Flow — CRM dashboard logic.
const $ = (id) => document.getElementById(id);
const api = (path, opts = {}) =>
  fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });

let messages = [];
let filter = 'all';
let search = '';

// ---------------- Auth ----------------
async function checkSession() {
  try {
    const res = await api('/api/auth/me');
    const data = await res.json();
    if (data.authenticated) showApp();
    else showLogin();
  } catch {
    showLogin();
  }
}

function showLogin() {
  $('login').classList.remove('hidden');
  $('app').classList.add('hidden');
}
function showApp() {
  $('login').classList.add('hidden');
  $('app').classList.remove('hidden');
  loadMessages();
}

function setLoginMsg(text, kind = '') {
  const el = $('loginMsg');
  el.textContent = text;
  el.className = 'msg' + (kind ? ' ' + kind : '');
}

async function login() {
  const username = $('username').value.trim();
  const password = $('password').value;
  if (!username || !password) {
    setLoginMsg('Enter your username and password.', 'error');
    return;
  }
  $('loginBtn').disabled = true;
  setLoginMsg('Signing in…');
  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      setLoginMsg('');
      $('password').value = '';
      showApp();
    } else {
      setLoginMsg(data.error || 'Incorrect username or password.', 'error');
    }
  } catch {
    setLoginMsg('Network error. Please try again.', 'error');
  } finally {
    $('loginBtn').disabled = false;
  }
}

$('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  login();
});

$('togglePw').addEventListener('click', () => {
  const p = $('password');
  const show = p.type === 'password';
  p.type = show ? 'text' : 'password';
  const btn = $('togglePw');
  btn.textContent = show ? 'Hide' : 'Show';
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  p.focus();
});

$('logoutBtn').addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  location.reload();
});

// ---------------- Messages ----------------
async function loadMessages() {
  try {
    const res = await api('/api/messages');
    if (res.status === 401) return showLogin();
    const data = await res.json();
    messages = data.messages || [];
    render();
  } catch {
    $('list').innerHTML = '<div class="empty"><h3>Could not load messages</h3><p>Please refresh.</p></div>';
  }
}

function render() {
  // Stats
  const counts = { new: 0, contacted: 0, archived: 0 };
  messages.forEach((m) => {
    counts[m.status] = (counts[m.status] || 0) + 1;
  });
  $('statNew').textContent = counts.new || 0;
  $('statContacted').textContent = counts.contacted || 0;
  $('statArchived').textContent = counts.archived || 0;
  $('statTotal').textContent = messages.length;

  // Filter + search
  const q = search.toLowerCase();
  const shown = messages.filter((m) => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (!q) return true;
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.message || '').toLowerCase().includes(q)
    );
  });

  const list = $('list');
  if (!shown.length) {
    list.innerHTML =
      '<div class="empty"><h3>Nothing here yet</h3><p>' +
      (messages.length ? 'No messages match this view.' : "New enquiries will appear here the moment they're sent.") +
      '</p></div>';
    return;
  }

  list.innerHTML = shown.map(cardHtml).join('');
}

function cardHtml(m) {
  const status = m.status || 'new';
  const date = formatDate(m.createdAt);
  const subject = encodeURIComponent('Re: your message to Flex & Flow');
  return `
    <article class="card ${status}">
      <div class="card-top">
        <div>
          <div class="card-name">${esc(m.name)}</div>
          <div class="card-email"><a href="mailto:${esc(m.email)}?subject=${subject}">${esc(m.email)}</a></div>
        </div>
        <div class="card-meta">
          <span class="badge ${status}">${status}</span>
          <div class="card-date">${date}</div>
        </div>
      </div>
      <div class="card-msg">${esc(m.message)}</div>
      <div class="actions">
        <a class="act primary" href="mailto:${esc(m.email)}?subject=${subject}">✉ Reply</a>
        ${status !== 'contacted' ? `<button class="act" data-act="status" data-id="${m.id}" data-status="contacted">Mark contacted</button>` : ''}
        ${status !== 'new' ? `<button class="act" data-act="status" data-id="${m.id}" data-status="new">Mark new</button>` : ''}
        ${status !== 'archived' ? `<button class="act" data-act="status" data-id="${m.id}" data-status="archived">Archive</button>` : ''}
        <button class="act danger" data-act="delete" data-id="${m.id}">Delete</button>
      </div>
    </article>`;
}

// Event delegation for card actions
$('list').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.act === 'status') {
    await updateStatus(id, btn.dataset.status);
  } else if (btn.dataset.act === 'delete') {
    if (confirm('Delete this message permanently?')) await deleteMessage(id);
  }
});

async function updateStatus(id, status) {
  const m = messages.find((x) => x.id === id);
  const prev = m ? m.status : null;
  if (m) m.status = status; // optimistic
  render();
  const res = await api('/api/messages/' + encodeURIComponent(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!res.ok && m) {
    m.status = prev;
    render();
  }
}

async function deleteMessage(id) {
  const res = await api('/api/messages/' + encodeURIComponent(id), { method: 'DELETE' });
  if (res.ok) {
    messages = messages.filter((m) => m.id !== id);
    render();
  }
}

// ---------------- Toolbar ----------------
document.querySelectorAll('.tab').forEach((tab) =>
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    filter = tab.dataset.filter;
    render();
  })
);
$('search').addEventListener('input', (e) => {
  search = e.target.value;
  render();
});
$('refreshBtn').addEventListener('click', loadMessages);

// ---------------- Utils ----------------
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Go
checkSession();
