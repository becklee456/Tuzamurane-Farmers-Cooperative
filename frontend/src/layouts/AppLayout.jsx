import {
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Moon,
  ReceiptText,
  Sprout,
  Sun,
  Truck,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/cooperatives', label: 'Cooperatives', icon: Building2 },
  { to: '/farmers', label: 'Farmers', icon: Users },
  { to: '/deliveries', label: 'Deliveries', icon: Truck },
  { to: '/payments', label: 'Payments', icon: ReceiptText },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/audit-logs', label: 'Audit Logs', icon: ClipboardList }
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('tuzamurane_theme') === 'dark');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('tuzamurane_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">
            <Sprout size={24} />
          </div>
          <div>
            <strong>Tuzamurane</strong>
            <span>Cooperative CMS</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-panel">
        <header className="topbar">
          <button className="icon-btn d-lg-none" onClick={() => setSidebarOpen(true)} title="Open navigation">
            <Menu size={20} />
          </button>
          <div>
            <div className="topbar-title">
              <FileText size={18} />
              <span>Tuzamurane Farmers Cooperative Management System</span>
            </div>
            <small>Nyamagabe District, Rwanda Cooperative Agency registered</small>
          </div>
          <div className="topbar-actions ms-auto">
            <button className="icon-btn" onClick={() => setDarkMode((value) => !value)} title="Toggle dark mode">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="user-chip">
              <span>{user?.name}</span>
              <small>{user?.role}</small>
            </div>
            <button className="icon-btn danger" onClick={handleLogout} title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
      {sidebarOpen && <button className="mobile-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
    </div>
  );
}
