import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/clinics', label: 'Find Clinics' },
  { to: '/labs', label: 'Symptom Checker' },
  { to: '/reports/upload', label: 'Upload Report', auth: true },
  { to: '/reports', label: 'My Reports', auth: true },
];

export default function Navbar() {
  const { isAuthenticated, isDoctor, user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-md shadow-primary-600/30 group-hover:shadow-primary-600/50 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Med<span className="text-primary-600">Locator</span></span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links
              .filter(({ auth }) => !auth || isAuthenticated)
              .map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* CTA / Auth */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600 hidden sm:block">
                  Hi, {user?.name?.split(' ')[0]}
                </span>
                {isDoctor && (
                  <Link to="/doctor-dashboard" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-xs hidden sm:inline-flex">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
