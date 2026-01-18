import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary-900/10 to-transparent pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10 glass-panel p-10 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full bg-stone-800 mb-4 shadow-lg border border-stone-700">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-center text-3xl font-serif font-bold text-gray-800 tracking-wide">
            Linda Salon
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-500 uppercase tracking-widest font-bold">
            管理後台
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100">
              <div className="text-sm text-red-800 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="電子郵件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-lg font-serif"
            >
              {isLoading ? '登入中...' : '登入系統'}
            </button>
          </div>

          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-stone-50 rounded-lg border border-stone-100">
              <p className="text-xs text-secondary-400 font-mono">
                admin@lindasalon.com / admin123456
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
