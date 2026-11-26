import { AlertCircle, Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignIn() {
  const { signInDemo, currentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      const res = signInDemo({ email, password, rememberMe });
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      navigate(from, { replace: true });
    }, 300);
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="bg-white rounded-2xl border border-[#E2D9C9] p-6 sm:p-8 space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
            CoolRoots Customer Account · Demo Auth Mode
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#261D17] mt-1">Sign In</h1>
          <p className="mt-1.5 text-sm text-[#5A4C43]">
            Access your saved delivery addresses, demo order history, and checkout.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F2ECE1] border border-[#D8CBB5] flex items-start gap-2.5 text-xs text-[#4A3D34]">
          <Info className="w-4 h-4 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            <strong>Simulated Demo Authentication:</strong> Firebase is not configured for this
            prototype, so accounts are stored locally in your browser. Please do not use real
            banking or personal passwords.
          </p>
        </div>

        {currentUser && (
          <div className="p-3.5 rounded-xl bg-[#EEF4F0] border border-[#C3D6CA] text-xs text-[#1E3D2F] flex items-center justify-between gap-3">
            <span>Currently signed in as {currentUser.fullName}.</span>
            <Link to="/profile" className="font-semibold underline underline-offset-2">
              Go to Profile
            </Link>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-[#FDF2F0] border border-[#E7B5A8] text-xs text-[#8D311B] flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signin-email" className="block text-xs font-medium text-[#261D17] mb-1.5">
              Email Address *
            </label>
            <input
              id="signin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="signin-password" className="block text-xs font-medium text-[#261D17]">
                Password *
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#B84E32] hover:text-[#9E3F26]"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your demo password"
                className="w-full pl-3.5 pr-11 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center text-[#65574D] hover:text-[#261D17] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-[#4A3D34] cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#B84E32] rounded"
            />
            <span>Remember me on this browser</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#EFE7DA] text-center text-sm text-[#5A4C43]">
          New to CoolRoots?{' '}
          <Link
            to="/signup"
            state={{ from }}
            className="font-semibold text-[#B84E32] hover:text-[#9E3F26]"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
