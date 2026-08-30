// Change this to your deployed backend URL in production
const API_BASE = 'http://localhost:5000/api';

let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');

// ---------- Tab switching ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('login-form').classList.toggle('hidden', btn.dataset.tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', btn.dataset.tab !== 'register');
  });
});

// ---------- Register ----------
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorEl = document.getElementById('register-error');
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    loginSuccess(data);
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

// ---------- Login ----------
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    loginSuccess(data);
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

function loginSuccess(data) {
  token = data.token;
  currentUser = { name: data.name, email: data.email };
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(currentUser));
  showApp();
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  token = null;
  currentUser = null;
  appScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
});

// ---------- App screen ----------
function showApp() {
  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  document.getElementById('user-name').textContent = `Hi, ${currentUser.name}`;
  loadNotes();
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    // token expired/invalid
    document.getElementById('logout-btn').click();
    throw new Error('Session expired, please log in again');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ---------- Notes ----------
async function loadNotes(search = '') {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const notes = await apiRequest(`/notes${query}`);
    renderNotes(notes);
  } catch (err) {
    console.error(err.message);
  }
}

function renderNotes(notes) {
  const grid = document.getElementById('notes-grid');
  const emptyState = document.getElementById('empty-state');
  grid.innerHTML = '';

  if (notes.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  notes.forEach((note) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.style.background = note.color || '#ffffff';

    const tagsHtml = (note.tags || [])
      .map((t) => `<span>${escapeHtml(t)}</span>`)
      .join('');

    card.innerHTML = `
      <h3>${note.pinned ? '📌 ' : ''}${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.content || '')}</p>
      <div class="note-tags">${tagsHtml}</div>
      <div class="note-actions">
        <button data-action="pin" data-id="${note._id}">${note.pinned ? 'Unpin' : 'Pin'}</button>
        <button data-action="edit" data-id="${note._id}">Edit</button>
        <button data-action="delete" data-id="${note._id}">Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => handleNoteAction(btn.dataset.action, btn.dataset.id));
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function handleNoteAction(action, id) {
  try {
    if (action === 'delete') {
      if (!confirm('Delete this note?')) return;
      await apiRequest(`/notes/${id}`, { method: 'DELETE' });
      loadNotes(document.getElementById('search-input').value);
    } else if (action === 'pin') {
      const notes = await apiRequest('/notes');
      const note = notes.find((n) => n._id === id);
      await apiRequest(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      loadNotes(document.getElementById('search-input').value);
    } else if (action === 'edit') {
      const notes = await apiRequest('/notes');
      const note = notes.find((n) => n._id === id);
      document.getElementById('note-title').value = note.title;
      document.getElementById('note-content').value = note.content;
      document.getElementById('note-tags').value = (note.tags || []).join(', ');
      document.getElementById('note-color').value = note.color || '#ffffff';
      document.getElementById('editing-note-id').value = note._id;
      document.getElementById('save-note-btn').textContent = 'Update Note';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('save-note-btn').addEventListener('click', async () => {
  const title = document.getElementById('note-title').value.trim();
  const content = document.getElementById('note-content').value.trim();
  const tags = document.getElementById('note-tags').value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const color = document.getElementById('note-color').value;
  const editingId = document.getElementById('editing-note-id').value;

  if (!title) {
    alert('Title is required');
    return;
  }

  try {
    if (editingId) {
      await apiRequest(`/notes/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content, tags, color }),
      });
    } else {
      await apiRequest('/notes', {
        method: 'POST',
        body: JSON.stringify({ title, content, tags, color }),
      });
    }
    resetEditor();
    loadNotes(document.getElementById('search-input').value);
  } catch (err) {
    alert(err.message);
  }
});

function resetEditor() {
  document.getElementById('note-title').value = '';
  document.getElementById('note-content').value = '';
  document.getElementById('note-tags').value = '';
  document.getElementById('note-color').value = '#ffffff';
  document.getElementById('editing-note-id').value = '';
  document.getElementById('save-note-btn').textContent = '+ Add Note';
}

// ---------- Search ----------
let searchTimeout;
document.getElementById('search-input').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadNotes(e.target.value), 300);
});

// ---------- Init ----------
if (token && currentUser) {
  showApp();
}
