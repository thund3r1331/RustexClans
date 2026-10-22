import React from 'react';
import { Clan } from '../types';
import { ClanLogo } from './ClanLogo';
import { Crown, Sparkles, Medal } from 'lucide-react';

interface PodiumViewProps {
  clans: Clan[];
  onSelectClan: (clan: Clan) => void;
}

export const PodiumView: React.FC<PodiumViewProps> = ({ clans, onSelectClan }) => {
  if (clans.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-500 font-mono text-xs bento-card p-8">
        Команды в топе пока отсутствуют
      </div>
    );
  }

  const clan1 = clans.find((c) => c.rank === 1) || clans[0];
  const clan2 = clans.find((c) => c.rank === 2) || (clans.length > 1 ? clans[1] : null);
  const clan3 = clans.find((c) => c.rank === 3) || (clans.length > 2 ? clans[2] : null);

  const renderCard = (
    clan: Clan,
    config: {
      label: string;
      accent: string;
      icon: React.ComponentType<{ className?: string }>;
      border: string;
      bg: string;
      orderClass: string;
      isWinner?: boolean;
    }
  ) => {
    const Icon = config.icon;

    return (
      <div
        key={clan.id}
        onClick={() => onSelectClan(clan)}
        className={`bento-card p-6 cursor-pointer relative group flex flex-col justify-between transition-all duration-300 ${config.border} ${config.bg} ${config.orderClass}`}
      >
        {config.isWinner && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[10px] font-bold font-mono tracking-wider shadow-md uppercase">
            ЛИДЕР СЕЗОНА
          </div>
        )}

        <div className="space-y-4">
          {/* Header ribbon */}
          <div className="flex items-center justify-between text-[11px] font-mono pb-3 border-b border-white/[0.06]">
            <div className={`flex items-center gap-1.5 font-bold ${config.accent}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full border text-xs font-bold font-mono ${
                config.isWinner
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                  : 'border-white/[0.08] bg-white/[0.02] text-zinc-300'
              }`}
            >
              #{clan.rank}
            </span>
          </div>

          {/* Clan Info */}
          <div className="flex items-center gap-3.5 pt-1">
            <ClanLogo logoUrl={clan.logo_url} sizeClass="w-14 h-14 rounded-2xl" iconSizeClass="w-6 h-6" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-zinc-400">[{clan.tag}]</span>
                <h3 className="font-bold text-white text-base group-hover:text-zinc-200 transition">
                  {clan.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
                  {clan.tier}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {clan.members.length} игроков
                </span>
              </div>
            </div>
          </div>

          {/* Description snippet */}
          {clan.description && (
            <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed pt-1">
              {clan.description}
            </p>
          )}

          {/* Roster badges preview */}
          <div className="flex flex-wrap gap-1 pt-1">
            {clan.members.slice(0, 3).map((member, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[10px] text-zinc-300 font-mono"
              >
                {member}
              </span>
            ))}
            {clan.members.length > 3 && (
              <span className="text-[10px] font-mono text-zinc-500 self-center">
                +{clan.members.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Points & Delta Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">RCL POINTS</span>
            <span className="text-xl font-bold text-white tabular-nums">
              {clan.points.toLocaleString('ru-RU')}
              <span className="text-xs text-zinc-500 font-normal ml-1">RCL POINTS</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {clan.rank_change > 0 && (
              <span className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                +{clan.rank_change}
              </span>
            )}
            {clan.rank_change < 0 && (
              <span className="px-2.5 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-bold">
                {clan.rank_change}
              </span>
            )}
            {clan.rank_change === 0 && (
              <span className="px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-zinc-500 text-xs">
                -
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onSelectClan(clan)}
          className="mt-3 w-full text-center text-xs font-sans text-zinc-500 hover:text-white transition py-1.5 rounded-xl border border-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.03] cursor-pointer"
        >
          подробнее →
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Топ-3 Пьедестал лидеров</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Лидеры соревновательного сезона Rustex Remake</p>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">
          Сезон 2026
        </span>
      </div>

      {/* Podium Grid: #2 Left (Silver), #1 Center (Gold, elevated), #3 Right (Bronze) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {clan2 &&
          renderCard(clan2, {
            label: 'TOP 2 // SILVER',
            accent: 'text-zinc-200',
            icon: Medal,
            border: 'border-white/[0.12] hover:border-white/30',
            bg: 'bg-gradient-to-b from-white/[0.02] to-transparent',
            orderClass: 'order-2 md:order-1',
          })}

        {clan1 &&
          renderCard(clan1, {
            label: 'TOP 1 // GOLD',
            accent: 'text-amber-300',
            icon: Crown,
            border: 'border-amber-400/35 hover:border-amber-400/60 shadow-xl shadow-amber-500/5',
            bg: 'bg-gradient-to-b from-amber-500/[0.05] via-[#0d0e12] to-transparent',
            orderClass: 'order-1 md:order-2 md:-translate-y-3',
            isWinner: true,
          })}

        {clan3 &&
          renderCard(clan3, {
            label: 'TOP 3 // BRONZE',
            accent: 'text-amber-600',
            icon: Sparkles,
            border: 'border-amber-700/25 hover:border-amber-700/40',
            bg: 'bg-gradient-to-b from-amber-700/[0.02] to-transparent',
            orderClass: 'order-3 md:order-3',
          })}
      </div>
    </div>
  );
};
