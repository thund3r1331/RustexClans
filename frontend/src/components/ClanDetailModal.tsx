import React, { useEffect, useState, useRef } from 'react';
import { X, Users, TrendingUp, Trophy, Edit3, Trash2 } from 'lucide-react';
import { Clan, RatingLog } from '../types';
import { ClanLogo } from './ClanLogo';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface ClanDetailModalProps {
  clan: Clan | null;
  onClose: () => void;
  onOpenAdjust?: (clan: Clan) => void;
  onDeleteClan?: (clan: Clan) => void;
  isModerator?: boolean;
}

export const ClanDetailModal: React.FC<ClanDetailModalProps> = ({
  clan,
  onClose,
  onOpenAdjust,
  onDeleteClan,
  isModerator,
}) => {
  const [history, setHistory] = useState<RatingLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clan) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/v1/clans/${clan.id}/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('Failed to load clan history', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [clan]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!clan) return null;

  // Prepare chart data
  const chartLabels = history.length > 0
    ? history.map((_, i) => `#${i + 1}`)
    : ['Начало', 'Текущее'];

  const chartPoints = history.length > 0
    ? history.map((h) => h.new_points)
    : [clan.previous_points || clan.points, clan.points];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Очки рейтинга',
        data: chartPoints,
        borderColor: '#ffffff',
        borderWidth: 2,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 180);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#000000',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 18, 0.95)',
        titleColor: '#a1a1aa',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        titleFont: { family: 'JetBrains Mono', size: 10 },
        bodyFont: { family: 'JetBrains Mono', size: 12, weight: 'bold' },
        callbacks: {
          label: (ctx: any) => `${ctx.raw} CRL`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 10 } },
      },
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] bg-[#0c0d10] backdrop-blur-3xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Logo, Name, Tier, Description */}
        <div className="flex items-start gap-4 pb-5 border-b border-white/[0.06]">
          <ClanLogo logoUrl={clan.logo_url} sizeClass="w-16 h-16 rounded-2xl" iconSizeClass="w-7 h-7" />
          <div className="space-y-1.5 flex-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-zinc-400">[{clan.tag}]</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">{clan.name}</h2>
            </div>
            {clan.description ? (
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">{clan.description}</p>
            ) : (
              <p className="text-xs text-zinc-600 font-sans italic">Описание отсутствует</p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-zinc-500" />
                <span>РАНГ: <b className="text-white">#{clan.rank}</b></span>
              </span>
              <span className="text-zinc-700">•</span>
              <span>ОЧКИ: <b className="text-white">{clan.points.toLocaleString('ru-RU')} CRL</b></span>
              <span className="text-zinc-700">•</span>
              <span>ТИР: <b className="text-zinc-200">{clan.tier}</b></span>
            </div>
          </div>
        </div>

        {/* Rating Dynamics Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ДИНАМИКА ФОРМЫ (CRL RATING)</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] h-48">
            {loadingHistory ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-600">
                Загрузка данных графика...
              </div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Lineup / Roster Members */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>СОСТАВ КЛАНА</span>
            </span>
            <span>{clan.members.length} игроков</span>
          </div>

          {clan.members.length === 0 ? (
            <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] text-center text-xs text-zinc-500 font-mono">
              Список игроков пока не заполнен
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {clan.members.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs font-mono text-zinc-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{member}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isModerator && (
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
            {onDeleteClan && (
              <button
                onClick={() => {
                  onClose();
                  onDeleteClan(clan);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-semibold text-xs transition cursor-pointer font-sans"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить клан</span>
              </button>
            )}

            {onOpenAdjust && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdjust(clan);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition shadow cursor-pointer font-sans ml-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Скорректировать очки</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
