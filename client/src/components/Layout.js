import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Menu, X, Workflow, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 768;

  // On desktop: sidebar open by default. On mobile: closed by default.
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Sync when screen size crosses breakpoint
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const navItems = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/app/my-tasks', icon: CheckSquare, label: 'My Tasks' },
  ];

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  return (
    <div style={s.wrapper}>
      <div className="app-bg-glow" />
      {/* Mobile overlay — only when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div style={s.overlay} onClick={closeSidebar} />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        ...s.sidebar,
        ...(isMobile ? s.sidebarMobile : {}),
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>
        {/* Logo + close button */}
        <div style={s.logoWrap}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span className="logo-dot" />
            <span style={s.logoText}>ProjectFlow</span>
          </div>
          {/* Close button inside sidebar */}
          <button
            onClick={closeSidebar}
            className="btn btn-icon"
            style={{ marginLeft: 'auto', flexShrink: 0 }}
            title="Close sidebar"
          >
            {isMobile ? <X size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav links */}
        <nav style={s.nav}>
          <p style={s.navSection}>Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              onClick={() => isMobile && closeSidebar()}
              style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span>{label}</span>
                  {isActive && <div style={s.navIndicator} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div style={s.sidebarBottom}>
          <div style={s.userCard}>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={s.userName}>{user?.name}</p>
              <p style={s.userEmail}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-icon" title="Logout" style={{ flexShrink: 0 }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{
        ...s.main,
        marginLeft: (!isMobile && sidebarOpen) ? 224 : 0,
      }}>
        {/* Top bar — always visible, has hamburger */}
        <div style={s.topbar}>
          <button className="btn btn-icon" onClick={toggleSidebar} title="Toggle sidebar" style={{ flexShrink: 0 }}>
            <Menu size={20} />
          </button>
          <div style={s.topbarLogo}>
            <span className="logo-dot" style={{ width: 8, height: 8 }} />
            <span style={{ ...s.logoText, fontSize: 15 }}>ProjectFlow</span>
          </div>
          {/* Right side user avatar on mobile */}
          {isMobile && (
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, marginLeft: 'auto', cursor: 'pointer' }}
              onClick={handleLogout} title="Logout">
              {initials}
            </div>
          )}
        </div>

        {/* Page content */}
        <div style={s.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const s = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    background: 'var(--bg-base)',
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    zIndex: 98,
  },
  sidebar: {
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    width: 224,
    background: 'rgba(17,17,19,0.72)',
    backdropFilter: 'blur(20px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column',
    boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
    zIndex: 99,
    transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
    willChange: 'transform',
  },
  sidebarMobile: {
    zIndex: 99,
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    minHeight: 58,
  },
  logoText: {
    fontSize: 16, fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em',
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1, padding: '14px 10px',
    display: 'flex', flexDirection: 'column', gap: 2,
    overflowY: 'auto',
  },
  navSection: {
    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    padding: '0 8px', marginBottom: 8,
  },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)', textDecoration: 'none',
    fontSize: 14, fontWeight: 400, position: 'relative',
    transition: 'var(--transition)',
  },
  navLinkActive: {
    color: 'var(--green)',
    background: 'var(--green-dim)',
    fontWeight: 500,
  },
  navIndicator: {
    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
    width: 3, height: 18, background: 'var(--green)',
    borderRadius: '2px 0 0 2px',
    boxShadow: '0 0 8px rgba(37,211,102,0.6)',
  },
  sidebarBottom: {
    padding: '10px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-elevated)',
  },
  userName: {
    fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: 11, color: 'var(--text-muted)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  main: {
    flex: 1,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
    transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)',
  },
  topbar: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '0 16px',
    height: 58, minHeight: 58,
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(10,10,11,0.82)',
    backdropFilter: 'blur(20px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
    flexShrink: 0,
  },
  topbarLogo: {
    display: 'flex', alignItems: 'center', gap: 9,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px 20px',
  },
};

export default Layout;