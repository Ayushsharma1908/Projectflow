import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Menu, X, ChevronLeft } from 'lucide-react';
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

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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
    <div className="flex h-screen bg-bg-base overflow-hidden relative">
      <div className="app-bg-glow" />
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/65 z-[98]" onClick={closeSidebar} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 bottom-0 w-56 bg-[#111113]/70 backdrop-blur-[20px] saturate-[1.6] border-r border-white/5 flex flex-col shadow-[4px_0_30px_rgba(0,0,0,0.5)] z-[99] transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-[14px] py-4 border-b border-white/5 min-h-[58px]">
          <div className="flex items-center gap-[9px]">
            <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_var(--tw-colors-green-DEFAULT)]" />
            <span className="text-base font-bold text-text-primary tracking-tighter whitespace-nowrap">ProjectFlow</span>
          </div>
          <button onClick={closeSidebar} className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-hover text-text-muted transition-colors ml-auto shrink-0" title="Close sidebar">
            {isMobile ? <X size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-3.5 flex flex-col gap-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] px-2 mb-2">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              onClick={() => isMobile && closeSidebar()}
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-normal relative transition-colors ${isActive ? 'text-green bg-green-dim font-medium' : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span>{label}</span>
                  {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-green rounded-l-sm shadow-[0_0_8px_rgba(48,209,88,0.6)]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-2.5 border-t border-white/5">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-bg-elevated">
            <div className="w-[34px] h-[34px] rounded-full bg-green-dim text-green border border-green-border flex items-center justify-center text-xs font-bold shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text-primary truncate">{user?.name}</p>
              <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted transition-colors shrink-0" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className={`flex-1 flex flex-col overflow-hidden w-full transition-[margin] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${!isMobile && sidebarOpen ? 'ml-56' : 'ml-0'}`}>
        <div className="flex items-center gap-3 px-4 h-[58px] min-h-[58px] border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-[20px] saturate-[1.6] shrink-0">
          <button className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-hover text-text-primary transition-colors shrink-0" onClick={toggleSidebar} title="Toggle sidebar">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-[9px]">
            <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_var(--tw-colors-green-DEFAULT)]" />
            <span className="text-[15px] font-bold text-text-primary tracking-tighter">ProjectFlow</span>
          </div>
          {isMobile && (
            <div className="w-8 h-8 rounded-full bg-green-dim text-green border border-green-border flex items-center justify-center text-[11px] font-bold ml-auto cursor-pointer" onClick={handleLogout} title="Logout">
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-5 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;