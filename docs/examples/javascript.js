// docs/examples/javascript.js - Exemplos com Fetch API (chamado do frontend, com cookie de sessao)

const API_BASE = 'http://localhost:5001/api';

// Todas as chamadas usam credentials: 'include' - a sessao e por cookie
// (connect.sid), nao por Authorization header. O login (GET /auth/login,
// direto na origem do backend - nao tem proxy /auth no Vite) precisa
// acontecer via navegacao real do navegador, nao via fetch.

async function getMe() {
  const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
  if (res.status === 302 || res.redirected) {
    throw new Error('Sem sessao - redirecionado pro login');
  }
  return res.json();
}

async function getDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`, { credentials: 'include' });
  return res.json();
}

async function getPlaylist(setorNome) {
  const res = await fetch(`${API_BASE}/playlist/${encodeURIComponent(setorNome)}`, { credentials: 'include' });
  if (res.status === 404) {
    throw new Error('Setor ou playlist nao encontrada');
  }
  return res.json();
}

async function uploadMedia(setorNome, files) {
  const formData = new FormData();
  for (const file of files) formData.append('media', file);

  const res = await fetch(`${API_BASE}/media/upload/${encodeURIComponent(setorNome)}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return res.json();
}

async function reorderPlaylist(orderedIds) {
  const res = await fetch(`${API_BASE}/playlist/reorder`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
  return res.json();
}

// Uso
(async () => {
  try {
    const me = await getMe();
    console.log('Usuario:', me.user);

    const dashboard = await getDashboard();
    console.log('Dashboard:', dashboard);
  } catch (error) {
    console.error('Erro:', error.message);
  }
})();
