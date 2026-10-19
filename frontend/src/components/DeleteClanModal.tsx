import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Clan } from '../types';
import { ClanLogo } from './ClanLogo';

interface DeleteClanModalProps {
  clan: Clan;
  token: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteClanModal: React.FC<DeleteClanModalProps> = ({
  clan,
  token,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDelete = async () => {
    if (!token) {
      setError('Требуется авторизация модератора');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/clans/${clan.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let msg = 'Ошибка при удалении клана';
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (Array.isArray(data.detail)) {
          msg = data.detail.map((e: any) => e.msg).join('; ');
        }
        throw new Error(msg);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сервера при удалении');
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
      <div className="relative max-w-md w-full p-6 sm:p-8 rounded-3xl border border-rose-500/20 bg-[#0c0d10] backdrop-blur-3xl shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Удаление клана</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Подтверждение удаления из ладдера
            </p>
          </div>
        </div>

        {/* Clan Card Info */}
        <div className="p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center gap-3">
          <ClanLogo logoUrl={clan.logo_url} sizeClass="w-12 h-12 rounded-xl" iconSizeClass="w-5 h-5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-zinc-400">[{clan.tag}]</span>
              <span className="font-bold text-sm text-white truncate">{clan.name}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mt-0.5">
              <span>{clan.tier}</span>
              <span className="text-zinc-700">•</span>
              <span className="text-white font-bold">{clan.points} CRL</span>
              <span className="text-zinc-700">•</span>
              <span>{clan.members.length} участников</span>
            </div>
          </div>
        </div>

        {/* Warning text */}
        <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] flex items-start gap-2.5 text-xs text-rose-300 font-sans leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            Вы действительно хотите удалить этот клан? Все записи о начислении очков и состав будут удалены из системы. Это действие необратимо.
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition text-xs font-sans font-medium cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-950/40 cursor-pointer font-sans disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Удаление...' : 'Удалить клан'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
