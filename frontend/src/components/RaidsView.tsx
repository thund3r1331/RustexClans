import React from 'react';
import { RatingLog } from '../types';
import { Flame, ExternalLink, ShieldCheck, Clock } from 'lucide-react';

interface RaidsViewProps {
  logs: RatingLog[];
  loading?: boolean;
}

export const RaidsView: React.FC<RaidsViewProps> = ({ logs, loading }) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Журнал рейдов и изменений рейтинга</span>
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Журнал всех подтвержденных модерацией событий
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-400 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">
          Всего записей: {logs.length}
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-500 font-mono text-xs bento-card">
          Загрузка журнала рейдов...
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 font-mono text-xs bento-card">
          Зафиксированных рейдов пока нет
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isPositive = log.delta > 0;
            return (
              <div
                key={log.id}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.12] transition-all space-y-3"
              >
                {/* Header: Clan + Delta + Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04] pb-3">
                  <div className="flex items-center gap-2.5">
                    {log.clan_tag && (
                      <span className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-bold font-mono text-zinc-300">
                        [{log.clan_tag}]
                      </span>
                    )}
                    {log.clan_name && (
                      <span className="font-bold text-sm text-white">
                        {log.clan_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    {/* Points flow */}
                    <div className="text-zinc-500 text-[11px] hidden sm:block">
                      <span>{log.old_points}</span>
                      <span className="mx-1 text-zinc-600">→</span>
                      <span className="text-zinc-200 font-bold">{log.new_points} RCL POINTS</span>
                    </div>

                    {/* Delta badge */}
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-xs ${
                        isPositive
                          ? 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                          : 'border border-rose-500/25 bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${log.delta}` : log.delta} RCL POINTS
                    </span>
                  </div>
                </div>

                {/* Reason description */}
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {log.reason}
                </p>

                {/* Footer: Moderator & Proof link & Date */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-500 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-zinc-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Модератор: <b className="text-zinc-300">{log.moderator_username}</b></span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-zinc-500">
                      <Clock className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{formatDate(log.created_at)}</span>
                    </span>
                  </div>

                  {log.proof_url && (
                    <a
                      href={log.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-white hover:underline transition"
                    >
                      <span>Пруф / Запись</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
