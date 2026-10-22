import React, { useState } from 'react';
import { X, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordRepeat) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'Ошибка регистрации — попробуйте другой ник'
        );
      }

      setDone(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative max-w-sm w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] bg-[#0c0d10] shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <p className="text-white font-semibold">Аккаунт создан!</p>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Обратитесь к администратору для привязки к вашему клану.
              После привязки вы сможете создавать и принимать альянсы.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  Регистрация лидера
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  Аккаунт для управления альянсами клана
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-1.5 tracking-wider">
                  Ник (Steam или игровой)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={50}
                  autoComplete="username"
                  placeholder="например: Aresckoy"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-white/30 transition placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-1.5 tracking-wider">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="мин. 6 символов"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 pr-10 text-white text-sm font-mono focus:outline-none focus:border-white/30 transition placeholder-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-1.5 tracking-wider">
                  Повторите пароль
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordRepeat}
                  onChange={(e) => setPasswordRepeat(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="повторите пароль"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-white/30 transition placeholder-zinc-600"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-400 font-mono p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans mt-1"
              >
                {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
              </button>

              <p className="text-[10px] text-zinc-600 font-mono text-center leading-relaxed">
                После регистрации администратор привяжет вас к вашему клану.
                Это необходимо для управления альянсами.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
