import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/my-tasks', icon: CheckSquare, label: 'My Tasks' },
  ];

  return (
    <div style={styles.wrapper}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : {}) }}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}><Zap size={16} strokeWidth={2.5} /></div>
          <span style={styles.logoText}>ProjectFlow</span>
        </div>

        <nav style={styles.nav}>
          <p style={styles.navSection}>Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span>{label}</span>
                  {isActive && <div style={styles.navIndicator} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userCard}>
            <div style={{ ...styles.avatar, width: 34, height: 34, fontSize: 13 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={styles.userName}>{user?.name}</p>
              <p style={styles.userEmail}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="btn-icon btn" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Topbar (mobile) */}
        <div style={styles.topbar}>
          <button className="btn btn-icon" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div style={{ ...styles.logo, paddingLeft: 0 }}>
            <div style={styles.logoIcon}><Zap size={14} strokeWidth={2.5} /></div>
            <span style={styles.logoText}>ProjectFlow</span>
          </div>
        </div>

        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex', height: '100vh',
    background: 'var(--bg-base)', overflow: 'hidden'
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    zIndex: 99, display: 'none',
    '@media (max-width: 768px)': { display: 'block' }
  },
  sidebar: {
    width: 220, flexShrink: 0,
    background: 'var(--bg-surface)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
    display: 'flex', flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    zIndex: 100,
  },
  sidebarOpen: { transform: 'translateX(0)' },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)'
  },
  logoIcon: {
    width: 30, height: 30,
    background: 'linear-gradient(135deg, var(--gold), #B08040)',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#0F0E0C', boxShadow: '0 2px 12px rgba(200,169,126,0.3)'
  },
  logoText: {
    fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
    color: 'var(--text-primary)', letterSpacing: '-0.01em'
  },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navSection: {
    fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    padding: '0 8px', marginBottom: 8
  },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)', textDecoration: 'none',
    fontSize: 14, fontWeight: 400, position: 'relative',
    transition: 'var(--transition)'
  },
  navLinkActive: {
    color: 'var(--gold)',
    background: 'var(--gold-dim)',
  },
  navIndicator: {
    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
    width: 3, height: 18, background: 'var(--gold)',
    borderRadius: '2px 0 0 2px'
  },
  sidebarBottom: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 10px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-elevated)'
  },
  avatar: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%', background: 'var(--gold-dim)', color: 'var(--gold)',
    border: '1px solid var(--gold-border)', fontWeight: 600, flexShrink: 0
  },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', minWidth: 0
  },
  topbar: {
    display: 'none', alignItems: 'center', gap: 12,
    padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
    background: 'var(--bg-surface)'
  },
  content: { flex: 1, overflow: 'auto', padding: '32px' }
};

export default Layout;
