// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Midia from './pages/Midia';
import MidiaSetor from './pages/MidiaSetor';
import AdminSetores from './pages/AdminSetores';
import AdminUsuarios from './pages/AdminUsuarios';
import AuthGate from './components/AuthGate';
import SemSetorAssociado from './components/SemSetorAssociado';
import AcessoNegado from './components/AcessoNegado';
import { logoutUrl } from './services/auth';
import { IDP_HOME_URL } from './config/backend';
import './App.css';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/midia': 'Mídia e Playlists',
  '/admin/setores': 'Setores e TVs',
  '/admin/usuarios': 'Usuários',
};

function pageTitleFor(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/midia/')) return 'Mídia e Playlists';
  return 'TV Signage';
}

// Guarda de rota exclusiva de ti (OS 12-B, secao 3.8 / OS 12-C, secao 3.4):
// esconder/bloquear no front, alem da protecao ja existente no backend
// (requireRole). O backend continua sendo a fonte de verdade - isto e so UX.
function RequireTi({ user, children }) {
  if (user.role !== 'ti') {
    return <AcessoNegado />;
  }
  return children;
}

// Um "usuario" so pode gerenciar o proprio setor - "ti" gerencia qualquer um.
function RequireProprioSetor({ user, children }) {
  const { setor } = useParams();
  if (user.role !== 'ti' && user.setor !== setor) {
    return <AcessoNegado />;
  }
  return children;
}

function AppContent({ user }) {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { path: '/', icon: 'fas fa-chart-pie', label: 'Dashboard' },
    { path: '/midia', icon: 'fas fa-photo-film', label: 'Mídia e Playlists' },
  ];

  if (user.role === 'ti') {
    navItems.push(
      { section: 'Administração' },
      { path: '/admin/setores', icon: 'fas fa-building', label: 'Setores e TVs' },
      { path: '/admin/usuarios', icon: 'fas fa-users', label: 'Usuários' }
    );
  }

  return (
    <div className="app-layout">
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <i className="fas fa-tv"></i>
            </div>
            <div className="sidebar-brand-text">
              <strong>TV Signage</strong>
              <span>Painel de Gestão</span>
            </div>
          </div>
          <a href={IDP_HOME_URL} className="sidebar-link" title="Voltar aos sistemas">
            <i className="fas fa-arrow-left"></i>
            Voltar aos sistemas
          </a>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) =>
            item.section ? (
              <div key={`s-${index}`} className="sidebar-section-label">
                {item.section}
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                onClick={closeSidebar}
              >
                <i className={item.icon}></i>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <i className="fas fa-user-circle"></i>
            <span>{user.name} ({user.role === 'ti' ? 'TI' : user.setor || 'sem setor'})</span>
            <a href={logoutUrl()} title="Sair">
              <i className="fas fa-right-from-bracket"></i>
            </a>
          </div>
          <button className="theme-toggle" onClick={() => setIsDark((prev) => !prev)}>
            <i className={isDark ? 'fas fa-sun' : 'fas fa-moon'}></i>
            {isDark ? 'Tema Claro' : 'Tema Escuro'}
          </button>
        </div>
      </aside>

      <div className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`} onClick={closeSidebar} />

      <div className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setSidebarOpen((open) => !open)} aria-label="Abrir menu">
            <i className="fas fa-bars"></i>
          </button>
          <div>
            <p className="topbar-subtitle">Bem-vindo, {user.name}</p>
            <h1 className="topbar-title">{pageTitleFor(location.pathname)}</h1>
          </div>
          <div className="topbar-actions">
            <span className="topbar-badge">
              <i className="fas fa-circle"></i>
              Sistema Online
            </span>
          </div>
        </header>

        <main className="page-content" onClick={closeSidebar}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/midia" element={<Midia user={user} />} />
            <Route
              path="/midia/:setor"
              element={
                <RequireProprioSetor user={user}>
                  <MidiaSetor user={user} />
                </RequireProprioSetor>
              }
            />
            <Route
              path="/admin/setores"
              element={
                <RequireTi user={user}>
                  <AdminSetores />
                </RequireTi>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <RequireTi user={user}>
                  <AdminUsuarios />
                </RequireTi>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        {(user) =>
          user.role === 'usuario' && !user.setorId ? (
            <SemSetorAssociado />
          ) : (
            <AppContent user={user} />
          )
        }
      </AuthGate>
    </BrowserRouter>
  );
}
