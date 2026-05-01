import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import CitizenDashboard from './pages/CitizenDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { cn } from './lib/utils';

// Role-specific accent colors using proper CSS custom properties
const roleColor: Record<UserRole, string> = {
  CITIZEN:   'var(--bl)',
  VOLUNTEER: 'var(--gr)',
  NGO:       'var(--vi)',
  ADMIN:     'var(--am)',
};

const roleLabel: Record<UserRole, string> = {
  CITIZEN:   'Citizen Portal',
  VOLUNTEER: 'Volunteer Hub',
  NGO:       'NGO Operations',
  ADMIN:     'Admin Oversight',
};

function Main() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('aasa_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error('Failed to load user from storage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('aasa_user', JSON.stringify(userData));
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aasa_user');
    navigate('/');
  };

  const switchRole = (newRole: UserRole) => {
    const newUser: User = {
      ...user!,
      role: newRole,
      name: newRole === 'CITIZEN' ? 'Sujal Patil' : `Official ${newRole}`,
    };
    setUser(newUser);
    localStorage.setItem('aasa_user', JSON.stringify(newUser));
    navigate(`/${newRole.toLowerCase()}`);
    setRoleMenuOpen(false);
  };

  if (loading) return null;

  const color = user ? roleColor[user.role] : 'var(--am)';

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden selection:bg-primary/20 selection:text-ink">
      {/* ── Top navigation bar (visible when logged in) ── */}
      {user && (
        <nav className="sticky top-0 z-[200] h-[60px] flex items-center justify-between px-6 md:px-8 bg-paper/88 backdrop-blur-3xl border-b border-white/5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-sm shadow-lg shadow-primary/20">🐾</div>
            <span className="font-serif font-bold text-lg tracking-tight">AASA</span>
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
              <Bell size={15} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-paper flex items-center justify-center text-[7px] font-mono font-black">2</div>
            </div>

            {/* Role switcher (dev convenience) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black"
                  style={{ backgroundColor: `${color}18`, color }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-serif text-xs font-bold leading-tight" style={{ color }}>{roleLabel[user.role]}</div>
                  <div className="text-[9px] text-white/30 leading-tight font-mono uppercase">Switch Role</div>
                </div>
                <ChevronDown size={12} className={cn('text-white/30 transition-transform', roleMenuOpen && 'rotate-180')} />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-50">
                  {(Object.keys(roleLabel) as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => switchRole(role)}
                      className={cn(
                        'w-full text-left px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider transition-all hover:bg-white/5',
                        user.role === role ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                      )}
                      style={{ color: roleColor[role] }}
                    >
                      {roleLabel[role]}
                    </button>
                  ))}
                  <div className="border-t border-white/5" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 flex items-center gap-2 text-xs font-bold text-white/30 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                  >
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Click-away for role menu */}
      {roleMenuOpen && (
        <div className="fixed inset-0 z-[199]" onClick={() => setRoleMenuOpen(false)} />
      )}

      <main>
        <Routes>
          <Route path="/"       element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <LandingPage />} />
          <Route path="/about"  element={<AboutPage />} />
          <Route path="/auth"   element={user ? <Navigate to="/" /> : <AuthPage onLogin={handleLogin} />} />

          <Route path="/citizen/*"   element={user?.role === 'CITIZEN'   ? <CitizenDashboard user={user} />   : <Navigate to="/auth" />} />
          <Route path="/volunteer/*" element={user?.role === 'VOLUNTEER' ? <VolunteerDashboard user={user} /> : <Navigate to="/auth" />} />
          <Route path="/ngo/*"       element={user?.role === 'NGO'       ? <NGODashboard user={user} />       : <Navigate to="/auth" />} />
          <Route path="/admin/*"     element={user?.role === 'ADMIN'     ? <AdminDashboard user={user} />     : <Navigate to="/auth" />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Main />
    </Router>
  );
}
