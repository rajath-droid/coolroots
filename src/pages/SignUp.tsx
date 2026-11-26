import { AlertCircle, CheckCircle2, Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUp() {
  const { signUpDemo } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/profile';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Demo password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter carefully.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the prototype terms and conditions to continue.');
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      const res = signUpDemo({ fullName, email, phone, password });
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccessMessage('Demo account created! Redirecting...');
      window.setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    }, 350);
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="bg-white rounded-2xl border border-[#E2D9C9] p-6 sm:p-8 space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#1E3D2F]">
            CoolRoots Customer Account · Demo Registration
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#261D17] mt-1">
            Create Account
          </h1>
          <p className="mt-1.5 text-sm text-[#5A4C43]">
            Save delivery addresses, track demo orders, and manage your cooling preferences.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F2ECE1] border border-[#D8CBB5] flex items-start gap-2.5 text-xs text-[#4A3D34]">
          <Info className="w-4 h-4 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            <strong>Prototype Demo Mode:</strong> Accounts are saved locally in browser
            storage for testing without a live Firebase or backend auth server.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-[#FDF2F0] border border-[#E7B5A8] text-xs text-[#8D311B] flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="p-3.5 rounded-lg bg-[#EEF4F0] border border-[#C3D6CA] text-xs text-[#1E3D2F] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-xs font-medium text-[#261D17] mb-1.5">
              Full Name *
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Aarav Mehta"
              className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="signup-email" className="block text-xs font-medium text-[#261D17] mb-1.5">
                Email Address *
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="signup-phone" className="block text-xs font-medium text-[#261D17] mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXXXXXXX"
                className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-xs font-medium text-[#261D17] mb-1.5">
              Password (min. 6 characters) *
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a demo password"
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

          <div>
            <label htmlFor="signup-confirm" className="block text-xs font-medium text-[#261D17] mb-1.5">
              Confirm Password *
            </label>
            <input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter demo password"
              className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2.5 text-xs text-[#4A3D34] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#B84E32] rounded shrink-0"
            />
            <span>
              I understand this is a prototype e-commerce website and agree to the simulated demo
              account terms.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] px-5 py-2.5 rounded-lg bg-[#1E3D2F] text-white text-sm font-medium hover:bg-[#173025] disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#EFE7DA] text-center text-sm text-[#5A4C43]">
          Already have a demo account?{' '}
          <Link
            to="/signin"
            state={{ from }}
            className="font-semibold text-[#B84E32] hover:text-[#9E3F26]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
