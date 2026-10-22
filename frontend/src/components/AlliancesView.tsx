import React, { useState } from 'react';
import { Handshake, Plus, Check, X, Trash2, Clock, Shield, ChevronDown } from 'lucide-react';
import { Alliance, Clan, User } from '../types';

interface AlliancesViewProps {
  alliances: Alliance[];
  clans: Clan[];
  user: User | null;
  myAlliances: Alliance[];
  onRequest: (targetClanId: number) => Promise<void>;
  onAccept: (allianceId: number) => Promise<void>;
  onReject: (allianceId: number) => Promise<void>;
  onDelete: (allianceId: number) => Promise<void>;
  loading: boolean;
}

export const AlliancesView: React.FC<AlliancesViewProps> = ({
  alliances,
  clans,
  user,
  myAlliances,
  onRequest,
  onAccept,
  onReject,
  onDelete,
  loading,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedClanId, setSelectedClanId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const isLeader = user?.role === 'clan_leader';
  const myClanId = user?.clan_id ?? null;

  const incoming = myAlliances.filter(
    (a) => a.target_clan_id === myClanId && a.status === 'pending'
  );
  const outgoing = myAlliances.filter(
    (a) => a.requester_clan_id === myClanId && a.status === 'pending'
  );
  const active = myAlliances.filter((a) => a.status === 'accepted');

  // Клановы доступные для запроса (не мой клан, нет pending/accepted)
  const alreadyLinked = new Set(
    myAlliances
      .filter((a) => a.status !== 'rejected')
      .flatMap((a) => [a.requester_clan_id, a.target_clan_id])
  );
  const available = clans.filter((c) => c.id !== myClanId && !alreadyLinked.has(c.id));

  const handleRequest = async () => {
    if (!selectedClanId) return;
    setSubmitting(true);
    try {
      await onRequest(Number(selectedClanId));
      setSelectedClanId('');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const doAction = async (fn: () => Promise<void>, id: number) => {
    setActionId(id);
    try {
      await fn();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Handshake className="w-5 h-5 text-zinc-400" />
            <span>Альянсы кланов</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Активные союзы между кланами сезона
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-400 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] self-start sm:self-auto">
          Активных: {alliances.length}
        </span>
      </div>

      {/* Панель лидера */}
      {isLeader && myClanId && (
        <div className="bento-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              Управление альянсами вашего клана
            </span>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition cursor-pointer font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Предложить альянс</span>
            </button>
          </div>

          {/* Форма запроса */}
          {showForm && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="relative flex-1">
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <select
                  value={selectedClanId}
                  onChange={(e) => setSelectedClanId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 pr-8 text-white text-xs font-mono focus:outline-none focus:border-white/25 transition appearance-none cursor-pointer"
                >
                  <option value="">— выберите клан —</option>
                  {available.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.tag}] {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleRequest}
                disabled={!selectedClanId || submitting}
                className="px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition disabled:opacity-40 cursor-pointer font-sans shrink-0"
              >
                {submitting ? 'Отправка...' : 'Отправить'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl border border-white/[0.06] text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Входящие заявки */}
          {incoming.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Входящие запросы ({incoming.length})
              </p>
              {incoming.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04]"
                >
                  <div className="flex items-center gap-2 text-xs font-mono min-w-0">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-white font-semibold truncate">
                      [{a.requester_clan_tag}] {a.requester_clan_name}
                    </span>
                    <span className="text-zinc-500">хочет альянс</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => doAction(() => onAccept(a.id), a.id)}
                      disabled={actionId === a.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                    >
                      <Check className="w-3 h-3" />
                      <span>Принять</span>
                    </button>
                    <button
                      onClick={() => doAction(() => onReject(a.id), a.id)}
                      disabled={actionId === a.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] hover:bg-rose-500/15 text-rose-400 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                    >
                      <X className="w-3 h-3" />
                      <span>Отклонить</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Исходящие */}
          {outgoing.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Ожидают ответа ({outgoing.length})
              </p>
              {outgoing.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2 text-xs font-mono min-w-0">
                    <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-zinc-300 truncate">
                      [{a.target_clan_tag}] {a.target_clan_name}
                    </span>
                    <span className="text-zinc-600">— ожидание</span>
                  </div>
                  <button
                    onClick={() => doAction(() => onDelete(a.id), a.id)}
                    disabled={actionId === a.id}
                    className="p-1.5 rounded-lg border border-white/[0.06] text-zinc-500 hover:text-rose-400 hover:border-rose-500/20 transition cursor-pointer disabled:opacity-40"
                    title="Отозвать заявку"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Активные альянсы моего клана */}
          {active.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Ваши альянсы ({active.length})
              </p>
              {active.map((a) => {
                const ally = a.requester_clan_id === myClanId
                  ? { name: a.target_clan_name, tag: a.target_clan_tag }
                  : { name: a.requester_clan_name, tag: a.requester_clan_tag };
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white font-semibold">[{ally.tag}] {ally.name}</span>
                    </div>
                    <button
                      onClick={() => doAction(() => onDelete(a.id), a.id)}
                      disabled={actionId === a.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] hover:bg-rose-500/15 text-rose-400 text-xs transition cursor-pointer disabled:opacity-40"
                      title="Разорвать альянс"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Разорвать</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {incoming.length === 0 && outgoing.length === 0 && active.length === 0 && (
            <p className="text-xs text-zinc-600 font-mono text-center py-2">
              У вашего клана пока нет альянсов
            </p>
          )}
        </div>
      )}

      {/* Публичный список всех альянсов */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500 font-mono text-xs bento-card">
          Загрузка альянсов...
        </div>
      ) : alliances.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 font-mono text-xs bento-card">
          Активных альянсов пока нет
        </div>
      ) : (
        <div className="space-y-2.5">
          {alliances.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.12] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="font-bold text-white">
                  [{a.requester_clan_tag}] {a.requester_clan_name}
                </span>
                <span className="text-zinc-600 text-xs">×</span>
                <span className="font-bold text-white">
                  [{a.target_clan_tag}] {a.target_clan_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                  Альянс
                </span>
                <span className="text-[10px] font-mono text-zinc-600">
                  {new Date(a.created_at).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Подсказка если не авторизован */}
      {!isLeader && (
        <p className="text-center text-xs text-zinc-600 font-mono py-2">
          Войдите как лидер клана чтобы управлять альянсами
        </p>
      )}
    </div>
  );
};
