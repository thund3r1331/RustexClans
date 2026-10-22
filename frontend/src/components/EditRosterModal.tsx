import React, { useState } from 'react';
import { X, UserPlus, Trash2, Check, AlertCircle, FileText, List } from 'lucide-react';
import { Clan } from '../types';
import { ClanLogo } from './ClanLogo';

interface EditRosterModalProps {
  clan: Clan;
  token: string | null;
  onClose: () => void;
  onSuccess: (updatedClan: Clan) => void;
}

export const EditRosterModal: React.FC<EditRosterModalProps> = ({
  clan,
  token,
  onClose,
  onSuccess,
}) => {
  const [members, setMembers] = useState<string[]>(clan.members || []);
  const [newNick, setNewNick] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState((clan.members || []).join(', '));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddNick = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newNick.trim();
    if (!trimmed) return;
    if (members.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Игрок "${trimmed}" уже есть в составе`);
      return;
    }
    setError(null);
    const updated = [...members, trimmed];
    setMembers(updated);
    setBulkText(updated.join(', '));
    setNewNick('');
  };

  const handleRemoveNick = (indexToRemove: number) => {
    const updated = members.filter((_, idx) => idx !== indexToRemove);
    setMembers(updated);
    setBulkText(updated.join(', '));
  };

  const handleSwitchMode = (bulk: boolean) => {
    if (bulk) {
      setBulkText(members.join(', '));
    } else {
      // Parse bulk text into members array
      const parsed = bulkText
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      // Remove duplicates preserving order
      const unique = Array.from(new Set(parsed));
      setMembers(unique);
    }
    setIsBulkMode(bulk);
  };

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    let finalMembers = members;
    if (isBulkMode) {
      finalMembers = Array.from(
        new Set(
          bulkText
            .split(/[,\n]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        )
      );
    }

    try {
      const res = await fetch(`/api/v1/clans/${clan.id}/roster`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ members: finalMembers }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'Ошибка при сохранении состава'
        );
      }

      onSuccess(data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
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
      <div className="relative max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] bg-[#0c0d10] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.06]">
          <ClanLogo logoUrl={clan.logo_url} sizeClass="w-12 h-12 rounded-2xl" iconSizeClass="w-5 h-5" />
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-zinc-400">[{clan.tag}]</span>
              <h3 className="text-lg font-bold text-white tracking-tight truncate">{clan.name}</h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Управление составом клана · {members.length} игроков
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs font-mono">
            <button
              type="button"
              onClick={() => handleSwitchMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                !isBulkMode
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Список игроков</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                isBulkMode
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Быстрый ввод</span>
            </button>
          </div>

          <span
            className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
              members.length >= 10
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            }`}
          >
            {members.length >= 10 ? 'Регламент: ОК (10+)' : `Нужно еще ${10 - members.length} до 10`}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode 1: Individual Chips + Add Input */}
        {!isBulkMode ? (
          <div className="space-y-4">
            {/* Input to add single player */}
            <form onSubmit={handleAddNick} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newNick}
                  onChange={(e) => setNewNick(e.target.value)}
                  placeholder="Никнейм игрока (например: NightFarmer)..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-white/30 transition placeholder-zinc-600"
                />
              </div>
              <button
                type="submit"
                disabled={!newNick.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition disabled:opacity-40 cursor-pointer font-sans shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </form>

            {/* List of members with delete buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">
                Текущий состав ({members.length}):
              </span>

              {members.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 font-mono border border-white/[0.04] bg-white/[0.01] rounded-2xl">
                  В составе пока нет ни одного игрока. Добавьте ник выше.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {members.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-mono text-zinc-600 w-5 text-right shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                        <span className="text-xs font-mono font-bold text-white truncate">
                          {member}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNick(idx)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                        title="Удалить из состава"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mode 2: Bulk Textarea */
          <div className="space-y-2">
            <label className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              Вставьте ники игроков через запятую или с новой строки:
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              placeholder="BeastLeader, RustAimGod, RocketMan, NightFarmer, ..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-white/30 transition placeholder-zinc-600"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/[0.08] text-zinc-400 hover:text-white text-xs font-sans transition cursor-pointer"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition cursor-pointer font-sans disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{loading ? 'Сохранение...' : 'Сохранить состав'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
