import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, isAdmin, isStudent, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleScrollTo(id) {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${id}`);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err.message);
    }
  }

  return (
    <nav className="bg-white border-b border-sand-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="Raj Stay Logo"
                className="h-11 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="font-display font-bold text-2xl sm:text-3xl text-forest-900 tracking-tight">
                Raj Stay
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-sand-800">
              <button
                type="button"
                onClick={() => handleScrollTo('rooms')}
                className="hover:text-forest-900 transition-colors py-1 hover:underline underline-offset-4 font-medium text-sand-800"
              >
                Rooms
              </button>
              <button
                type="button"
                onClick={() => handleScrollTo('mess-menu')}
                className="hover:text-forest-900 transition-colors py-1 hover:underline underline-offset-4 font-medium text-sand-800"
              >
                Mess Menu
              </button>
              {isStudent && (
                <Link
                  to="/dashboard"
                  className="hover:text-forest-900 transition-colors py-1 hover:underline underline-offset-4"
                >
                  My Bookings
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hover:text-forest-900 transition-colors py-1 hover:underline underline-offset-4 font-semibold text-forest-800"
                >
                  Admin Management
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-forest-900">
                    {profile?.name || user.email}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-terracotta-600">
                    {profile?.role || 'student'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="bg-sand-100 hover:bg-sand-200 text-sand-900 text-xs font-semibold px-3 py-2 border border-sand-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-sand-800 hover:text-forest-900 px-3 py-2 transition-colors hover:underline underline-offset-4"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-forest-800 hover:bg-forest-900 text-white text-sm font-semibold px-4 py-2 border border-forest-900 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-sand-800 hover:text-forest-900 border border-sand-300"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-200 bg-sand-50 px-4 pt-3 pb-4 space-y-2">
          <button
            type="button"
            onClick={() => handleScrollTo('rooms')}
            className="block w-full text-left py-2 text-sm font-semibold text-sand-900 hover:text-forest-900"
          >
            Rooms
          </button>
          <button
            type="button"
            onClick={() => handleScrollTo('mess-menu')}
            className="block w-full text-left py-2 text-sm font-semibold text-sand-900 hover:text-forest-900"
          >
            Mess Menu
          </button>
          {isStudent && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-sand-900 hover:text-forest-900"
            >
              My Bookings
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-forest-800"
            >
              Admin Management
            </Link>
          )}
          <div className="pt-3 border-t border-sand-200">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-sand-800">
                  Signed in as <span className="font-semibold text-forest-900">{profile?.name || user.email}</span> ({profile?.role})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left py-2 text-xs font-semibold text-terracotta-600 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-sand-900 bg-white border border-sand-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-white bg-forest-800"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
