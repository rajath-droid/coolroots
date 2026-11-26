import { AlertCircle, ArrowLeft, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPassword() {
  const { resetDemoPassword } = useStore();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New demo password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      const res = resetDemoPassword(email, newPassword);
      setLoading(false);
      if (!res.ok) {
        setError(res.error || 'Could not reset demo password.');
        return;
      }
      setSuccess(true);
    }, 300);
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="bg-white rounded-2xl border border-[#E2D9C9] p-6 sm:p-8 space-y-6">
        <div>
          <Link
            to="/signin"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#65574D] hover:text-[#B84E32] mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Sign In</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-[#261D17]">
            Reset Demo Password
          </h1>
          <p className="mt-1.5 text-sm text-[#5A4C43]">
            Update the password for an existing local demo account stored in this browser.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F2ECE1] border border-[#D8CBB5] flex items-start gap-2.5 text-xs text-[#4A3D34]">
          <Info className="w-4 h-4 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Because this prototype runs locally without an email server, password recovery updates
            your local browser demo account directly.
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

        {success ? (
          <div className="p-5 rounded-xl bg-[#EEF4F0] border border-[#C3D6CA] space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1E3D2F]">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span>Demo Password Updated</span>
            </div>
            <p className="text-xs text-[#2B5240]">
              Your local demo account password has been updated. You can now sign in with your new
              password.
            </p>
            <Link
              to="/signin"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#1E3D2F] text-white text-xs font-medium hover:bg-[#173025]"
            >
              Continue to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fp-email" className="block text-xs font-medium text-[#261D17] mb-1.5">
                Registered Demo Email *
              </label>
              <input
                id="fp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="fp-new" className="block text-xs font-medium text-[#261D17] mb-1.5">
                New Password (min. 6 characters) *
              </label>
              <input
                id="fp-new"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="fp-confirm" className="block text-xs font-medium text-[#261D17] mb-1.5">
                Confirm New Password *
              </label>
              <input
                id="fp-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm focus:bg-white focus:border-[#B84E32] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] disabled:opacity-60 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>{loading ? 'Updating...' : 'Reset Demo Password'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
