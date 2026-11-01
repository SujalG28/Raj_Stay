import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signIn, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await signIn({ email, password });
      const currentProfile = await refreshProfile();

      if (currentProfile?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectPath || '/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Sign in failed:', err);
      setErrorMsg(
        err.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please verify your credentials and try again.'
          : err.message || 'An error occurred while signing in.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white border border-sand-200 p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-forest-900">
              Sign In to Raj Stay
            </h1>
            <p className="text-sm text-sand-800 mt-1">
              Enter your registered student or administrator credentials.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-terracotta-50 border border-terracotta-500 text-terracotta-700 text-sm leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@student.college.edu"
                className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-forest-800 hover:bg-forest-900 text-white font-semibold py-2.5 px-4 text-sm border border-forest-900 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Verifying credentials...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-sand-200 text-center text-xs text-sand-800">
            Need a room at Raj Stay?{' '}
            <Link to="/register" className="font-semibold text-forest-800 hover:underline">
              Create a student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
