import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const data = await signUp({
        name,
        phone,
        email,
        password,
      });

      if (data.session) {
        navigate('/dashboard');
      } else {
        setSuccessMsg(
          'Registration complete. If email confirmation is enabled on your project, check your inbox to confirm, then proceed to sign in.'
        );
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMsg(err.message || 'Failed to complete registration.');
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
              Student Registration
            </h1>
            <p className="text-sm text-sand-800 mt-1">
              Create an account to submit room booking requests and track stay status.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-terracotta-50 border border-terracotta-500 text-terracotta-700 text-sm leading-relaxed">
              {errorMsg}
            </div>
          )}

          {successMsg ? (
            <div className="space-y-4">
              <div className="p-4 bg-forest-50 border border-forest-600 text-forest-900 text-sm leading-relaxed">
                {successMsg}
              </div>
              <Link
                to="/login"
                className="block text-center w-full bg-forest-800 hover:bg-forest-900 text-white font-semibold py-2.5 px-4 text-sm border border-forest-900"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
                />
              </div>

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
                  placeholder="rahul@example.com"
                  className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
                  Create Password (minimum 6 characters)
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-forest-800 hover:bg-forest-900 text-white font-semibold py-2.5 px-4 text-sm border border-forest-900 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Creating account...' : 'Register Account'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-sand-200 text-center text-xs text-sand-800">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-forest-800 hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
