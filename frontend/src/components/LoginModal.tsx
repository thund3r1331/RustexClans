import React, { useState } from 'react';
import { X, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (token: string, user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Неверный логин или пароль');
      }

      const { access_token } = await res.json();

      // Fetch user profile
      const meRes = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!meRes.ok) throw new Error('Не удалось получить профиль');
      const user = await meRes.json();

      onLoginSuccess(access_token, user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-sm w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] bg-[#0c0d10] backdrop-blur-3xl shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
            <Lock className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Вход в аккаунт</h3>
            <p className="text-[11px] text-zinc-500 font-mono">Лидеры кланов · Модераторы</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 uppercase mb-1">Логин:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Логин"
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">Пароль:</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 pr-10 text-white focus:outline-none focus:border-white/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition p-0.5 cursor-pointer"
                title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-rose-400 text-xs p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition shadow-xl font-sans mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Проверка...' : 'Войти в систему'}
          </button>
        </form>
      </div>
    </div>
  );
};
