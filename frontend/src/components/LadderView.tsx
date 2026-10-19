import React from 'react';
import { Search, SlidersHorizontal, Info, Edit3, Trash2 } from 'lucide-react';
import { Clan, User } from '../types';
import { ClanLogo } from './ClanLogo';

interface LadderViewProps {
  clans: Clan[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTier: string;
  onTierChange: (tier: string) => void;
  user: User | null;
  onSelectClan: (clan: Clan) => void;
  onOpenAdjust: (clan: Clan) => void;
  onDeleteClan?: (clan: Clan) => void;
}

export const LadderView: React.FC<LadderViewProps> = ({
  clans,
  searchQuery,
  onSearchChange,
  selectedTier,
  onTierChange,
  user,
  onSelectClan,
  onOpenAdjust,
  onDeleteClan,
}) => {
  const tiers = [
    { id: '', label: 'Все ранги' },
    { id: 'Tier 1', label: 'Tier 1' },
    { id: 'Tier 2', label: 'Tier 2' },
    { id: 'Tier 3', label: 'Tier 3' },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по названию или тегу..."
            className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-white/30 transition"
          />
        </div>

        {/* Tier filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <div className="hidden lg:flex items-center gap-1 text-zinc-500 mr-1 text-[11px]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Фильтр:</span>
          </div>
          {tiers.map((t) => {
            const isActive = selectedTier === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTierChange(t.id)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow'
                    : 'bg-white/[0.02] border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ladder Rows */}
      {clans.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 font-mono text-xs bento-card">
          Команд по вашему запросу не найдено
        </div>
      ) : (
        <div className="space-y-2.5">
          {clans.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.035] hover:border-white/[0.14] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Rank, Delta, Logo, Clan details */}
              <div className="flex items-center gap-3.5">
                <div className="w-8 text-center shrink-0">
                  <span className="font-mono font-bold text-sm text-white group-hover:text-zinc-200">
                    #{c.rank}
                  </span>
                </div>

                <div className="shrink-0 font-mono text-[10px] font-bold">
                  {c.rank_change > 0 && (
                    <span className="px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                      +{c.rank_change}
                    </span>
                  )}
                  {c.rank_change < 0 && (
                    <span className="px-2 py-0.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400">
                      {c.rank_change}
                    </span>
                  )}
                  {c.rank_change === 0 && (
                    <span className="px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-zinc-500">
                      -
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onSelectClan(c)}
                >
                  <ClanLogo logoUrl={c.logo_url} sizeClass="w-10 h-10 rounded-xl" iconSizeClass="w-4 h-4" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white hover:underline transition">
                        {c.name}
                      </span>
                      <span className="font-mono text-xs text-zinc-400">[{c.tag}]</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        {c.tier}
                      </span>
                      <span className="text-zinc-700 text-[10px]">•</span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {c.members.length} участников
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roster Pills, Points & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3.5 font-mono">
                {/* Roster tags preview */}
                <div className="hidden lg:flex items-center gap-1 max-w-xs overflow-hidden">
                  {c.members.slice(0, 3).map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[10px] text-zinc-300 font-mono truncate"
                    >
                      {m}
                    </span>
                  ))}
                  {c.members.length > 3 && (
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      +{c.members.length - 3}
                    </span>
                  )}
                </div>

                {/* Points */}
                <div className="text-right sm:w-28 shrink-0">
                  <span className="font-bold text-white text-sm tabular-nums">
                    {c.points.toLocaleString('ru-RU')}
                  </span>
                  <span className="text-[10px] text-zinc-500 ml-1">CRL</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onSelectClan(c)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition text-xs cursor-pointer font-sans"
                  >
                    <Info className="w-3 h-3" />
                    <span>Инфо</span>
                  </button>

                  {user && (
                    <>
                      <button
                        onClick={() => onOpenAdjust(c)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition shadow cursor-pointer font-sans"
                        title="Скорректировать очки"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Очки</span>
                      </button>

                      {onDeleteClan && (
                        <button
                          onClick={() => onDeleteClan(c)}
                          className="flex items-center justify-center w-7 h-7 rounded-full border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition text-xs cursor-pointer font-sans"
                          title="Удалить клан"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
