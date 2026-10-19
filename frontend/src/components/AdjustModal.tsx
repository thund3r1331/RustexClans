import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Clan } from '../types';

interface AdjustModalProps {
  clan: Clan | null;
  token: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface Preset {
  id: string;
  label: string;
  delta: number;
  reason: string;
  badge: string;
  isNegative?: boolean;
}

const SCORING_PRESETS: Preset[] = [
  {
    id: 'raid_above_win',
    label: 'Победа над кланом выше',
    delta: 10,
    reason: 'Победа в онлайн-рейде над кланом выше в рейтинге (+10 CRL)',
    badge: '+10 CRL',
  },
  {
    id: 'raid_below_win',
    label: 'Победа над кланом ниже',
    delta: 5,
    reason: 'Победа в онлайн-рейде над кланом ниже в рейтинге (+5 CRL)',
    badge: '+5 CRL',
  },
  {
    id: 'raid_above_loss',
    label: 'Поражение клану выше',
    delta: -5,
    reason: 'Поражение в онлайн-рейде клану выше рейдера в рейтинге (-5 CRL)',
    badge: '-5 CRL',
    isNegative: true,
  },
  {
    id: 'raid_below_loss',
    label: 'Поражение клану ниже',
    delta: -10,
    reason: 'Поражение в онлайн-рейде клану ниже рейдера в рейтинге (-10 CRL)',
    badge: '-10 CRL',
    isNegative: true,
  },
  {
    id: 'crate',
    label: 'Забирание крейта',
    delta: 5,
    reason: 'Забирание крейта при активном онлайне (+5 CRL)',
    badge: '+5 CRL',
  },
  {
    id: 'rockets',
    label: 'Рекорды ракет',
    delta: 10,
    reason: 'Рекорд ракет при рейде (+10 CRL)',
    badge: '+10 CRL',
  },
];

export const AdjustModal: React.FC<AdjustModalProps> = ({
  clan,
  token,
  onClose,
  onSuccess,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('raid_above_win');
  const [delta, setDelta] = useState<number>(10);
  const [reason, setReason] = useState<string>('Победа в онлайн-рейде над кланом выше в рейтинге (+10 CRL)');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!clan) return null;

  const currentPoints = clan.points;
  const projectedPoints = Math.min(1000, Math.max(0, currentPoints + delta));

  const applyPreset = (preset: Preset) => {
    setSelectedPreset(preset.id);
    setDelta(preset.delta);
    setReason(preset.reason);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Укажите причину изменения или выберите регламент');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/clans/${clan.id}/adjust-rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delta,
          reason: reason.trim(),
          proof_url: proofUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let msg = 'Ошибка при корректировке рейтинга';
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (Array.isArray(data.detail)) {
          msg = data.detail
            .map((e: any) => `${e.loc && e.loc.length > 1 ? e.loc[e.loc.length - 1] + ': ' : ''}${e.msg}`)
            .join('; ');
        }
        throw new Error(msg);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сервера');
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
      <div className="relative max-w-md w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] bg-[#0c0d10] backdrop-blur-3xl shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Корректировка очков</h3>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Клан: <b className="text-white">[{clan.tag}] {clan.name}</b>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Quick Preset Selector */}
          <div>
            <label className="block text-zinc-400 uppercase text-[11px] mb-2">
              Регламент начисления / списания (быстрый выбор):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SCORING_PRESETS.map((preset) => {
                const isActive = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'border-white bg-white/10 text-white shadow-lg'
                        : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                    }`}
                  >
                    <span className="font-sans text-[11px] font-medium leading-tight">
                      {preset.label}
                    </span>
                    <span
                      className={`font-mono font-bold text-xs mt-1 ${
                        preset.isNegative ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">
              Дельта очков (+/- CRL):
            </label>
            <input
              type="number"
              value={delta}
              onChange={(e) => {
                setDelta(parseInt(e.target.value, 10) || 0);
                setSelectedPreset('');
              }}
              required
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
            />
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1.5">
              <span>Текущие: <b className="text-zinc-300">{currentPoints} CRL</b></span>
              <span>Итоговые: <b className="text-white font-bold">{projectedPoints} CRL</b> <span className="text-[10px] text-zinc-500">(макс. 1 000)</span></span>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">
              Причина / Номер заявки (обязательно):
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={2}
              placeholder="Например: Заявка #104: Оффлайн рейд мейн базы BLOOD"
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/40 font-sans"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">
              Ссылка на пруф / видеофиксацию:
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/40"
            />
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
            {loading ? 'Сохранение...' : 'Подтвердить начисление'}
          </button>
        </form>
      </div>
    </div>
  );
};
