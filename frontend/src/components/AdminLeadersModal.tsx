import React, { useState, useEffect } from 'react';
import { X, Users, Shield, Check, AlertCircle } from 'lucide-react';
import { Clan, User } from '../types';

interface AdminLeadersModalProps {
  token: string | null;
  clans: Clan[];
  onClose: () => void;
}

export const AdminLeadersModal: React.FC<AdminLeadersModalProps> = ({
  token,
  clans,
  onClose,
}) => {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [selectedClanMap, setSelectedClanMap] = useState<Record<number, number | ''>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchLeaders = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Не удалось загрузить список лидеров');
      }
      const data: User[] = await res.json();
      setLeaders(data);

      const initialMap: Record<number, number | ''> = {};
      data.forEach((u) => {
        initialMap[u.id] = u.clan_id ?? '';
      });
      setSelectedClanMap(initialMap);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, [token]);

  const handleAssign = async (userId: number) => {
    if (!token) return;
    setSavingId(userId);
    setError(null);
    setSuccessMsg(null);

    const clanVal = selectedClanMap[userId];
    const clanId = clanVal === '' ? null : Number(clanVal);

    try {
      const res = await fetch(`/api/v1/auth/users/${userId}/assign-clan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clan_id: clanId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Ошибка привязки клана');
      }

      setSuccessMsg('Клан успешно привязан');
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchLeaders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] bg-[#0c0d10] shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              Управление лидерами кланов
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Привязка зарегистрированных пользователей к кланам
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06]">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            Загрузка списка лидеров...
          </div>
        ) : leaders.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            Зарегистрированных лидеров кланов пока нет
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader) => {
              const currentClan = clans.find((c) => c.id === leader.clan_id);
              return (
                <div
                  key={leader.id}
                  className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-bold text-white text-sm">{leader.username}</span>
                      <span className="text-[10px] font-mono text-zinc-500">#{leader.id}</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      {currentClan ? (
                        <span className="text-emerald-400">
                          Привязан: [{currentClan.tag}] {currentClan.name}
                        </span>
                      ) : (
                        <span className="text-amber-400/80">Не привязан к клану</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedClanMap[leader.id] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setSelectedClanMap((prev) => ({ ...prev, [leader.id]: val }));
                      }}
                      className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-white/30 transition max-w-[190px]"
                    >
                      <option value="">— без клана —</option>
                      {clans.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.tag}] {c.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAssign(leader.id)}
                      disabled={savingId === leader.id}
                      className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition cursor-pointer font-sans disabled:opacity-50"
                    >
                      {savingId === leader.id ? '...' : 'Сохранить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
