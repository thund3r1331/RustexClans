import React from 'react';
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Users,
  Compass,
  Trophy,
  ShieldCheck,
  Disc,
} from 'lucide-react';

export const RulesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Регламент и правила начисления очков</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Официальный соревновательный регламент RustexClans (CRL) • Лимит 1 000 CRL
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold">
            MAX: 1 000 CRL
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400">
            START: 0 CRL
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Онлайн-рейды */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
            <Zap className="w-4 h-4" />
            <span>01 // ОНЛАЙН-РЕЙДЫ (ПОБЕДЫ И ПОРАЖЕНИЯ)</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Очки за рейды начисляются атакующему клану и списываются у защитников только при условии подтвержденного онлайн-рейда с видеозаписью (откатом).
          </p>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
              <div>
                <span className="text-white font-bold block">Победа: рейд клана выше твоего в топе</span>
                <span className="text-[11px] text-zinc-500 font-sans">Успешный рейд соперника с более высоким рейтингом</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">+20 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04]">
              <div>
                <span className="text-zinc-200 font-bold block">Поражение: тебя зарейдил клан выше в топе</span>
                <span className="text-[11px] text-zinc-500 font-sans">Потеря мейн базы клану выше по рейтингу</span>
              </div>
              <span className="text-rose-400 font-bold text-sm shrink-0 ml-3">-20 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
              <div>
                <span className="text-white font-bold block">Победа: рейд клана ниже твоего в топе</span>
                <span className="text-[11px] text-zinc-500 font-sans">Успешный рейд соперника с более низким рейтингом</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">+15 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04]">
              <div>
                <span className="text-zinc-200 font-bold block">Поражение: тебя зарейдил клан ниже в топе</span>
                <span className="text-[11px] text-zinc-500 font-sans">Потеря мейн базы клану ниже по рейтингу</span>
              </div>
              <span className="text-rose-400 font-bold text-sm shrink-0 ml-3">-15 CRL</span>
            </div>
          </div>
        </div>

        {/* Card 2: Ивенты, Вертолеты и Топ */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold">
            <Flame className="w-4 h-4" />
            <span>02 // ИВЕНТЫ, ВЕРТОЛЕТЫ И РЕКОРДЫ</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Очки за доминирование на серверных ивентах и ключевых боевых активностях.
          </p>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.015]">
              <div>
                <span className="text-zinc-200 font-bold block">Забирание вертолёта</span>
                <span className="text-[11px] text-zinc-500 font-sans">Сбитие и успешное удержание ящиков патрульного вертолёта</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">+7 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.015]">
              <div>
                <span className="text-zinc-200 font-bold block">Забирание крейта</span>
                <span className="text-[11px] text-zinc-500 font-sans">Успешный захват и лут крейта при активном онлайне сервера</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">+5 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.015]">
              <div>
                <span className="text-zinc-200 font-bold block">Рекорды ракет</span>
                <span className="text-[11px] text-zinc-500 font-sans">Установление подтвержденного рекорда выпущенных ракет при рейде</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">+3 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04]">
              <div>
                <span className="text-amber-300 font-bold block">Заняли первое место в топе</span>
                <span className="text-[11px] text-zinc-400 font-sans">Бонус за взятие строчки #1 в ладдере</span>
              </div>
              <span className="text-amber-400 font-bold text-sm shrink-0 ml-3">+2 CRL</span>
            </div>
          </div>
        </div>

        {/* Card 3: Обязательные правила и регламент */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>03 // ОБЯЗАТЕЛЬНЫЙ РЕГЛАМЕНТ РЕЙДОВ И КЛАНОВ</span>
          </div>
          <div className="space-y-3 text-xs font-sans">
            <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.015] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold font-mono">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>ОНЛАЙН-РЕЙД (КРИТЕРИЙ)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Онлайн-рейдом считается ситуация, когда <b>как минимум половина состава клана находится в сети</b> на сервере! Офлайн-рейды категорически не засчитываются.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.015] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold font-mono">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>КВАДРАТ ЗАСТРОЙКИ В ДИСКОРДЕ</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Каждый клан в начале своего вайпа <b>обязан написать в Discord свой квадрат</b>, где они будут строить основную базу.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.015] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ЗАЩИТА ПРИ АНТИРЕЙДЕ СВОЕЙ БАЗЫ</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Если клан шваркнули во время антирейда своей базы, <b>их количество очков не уменьшается</b> — главное, чтобы был <b>полный откат (видеозапись)</b>.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Альянсы, Состав и Подача заявок */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>04 // АЛЬЯНСЫ, СОСТАВ И ПОДАЧА ЗАЯВОК</span>
          </div>
          <div className="space-y-3 text-xs font-sans">
            <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.015] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold font-mono">
                <Users className="w-4 h-4 text-amber-400" />
                <span>РЕЙДЫ АЛЬЯНСОМ</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Если несколько кланов проводят рейд в альянсе, заработанные <b>очки делятся пополам</b> между союзными кланами.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.015] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold font-mono">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>МИНИМАЛЬНЫЙ СОСТАВ КЛАНА</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Для участия клана в ладдере требуется <b>минимум 10 игроков</b> в составе.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.05] space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold font-mono">
                <Disc className="w-4 h-4" />
                <span>ПОДТВЕРЖДЕНИЕ И ЗАЯВКИ</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Все заявки на начисление очков и откаты онлайн-рейдов принимаются исключительно через{' '}
                <a
                  href="https://discord.gg/T2z57z68N9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline font-bold hover:text-indigo-300"
                >
                  Discord-сервер CRL
                </a>
                . Без видеозаписи начисление очков не производится.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
