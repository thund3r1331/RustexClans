import React from 'react';
import { Zap, AlertTriangle, CheckCircle2, Mail, Flame } from 'lucide-react';

export const RulesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Регламент и правила начисления очков</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Соревновательный ладдер: лимит 1 000 CRL • старт с 0 CRL
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
        {/* Card 1: Рейды кланов (Победы и Поражения) */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
            <Zap className="w-4 h-4" />
            <span>01 // ОНЛАЙН-РЕЙДЫ (ПОБЕДЫ И ПОРАЖЕНИЯ)</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Очки за рейды начисляются и списываются исключительно по результатам онлайн-сражений при подтвержденном видео.
          </p>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
              <div>
                <span className="text-white font-bold block">Победа: рейд клана выше твоего рейтинга</span>
                <span className="text-[11px] text-zinc-500 font-sans">Победа над соперником, стоящим выше в таблице</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">+10 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
              <div>
                <span className="text-white font-bold block">Победа: рейд клана ниже твоего рейтинга</span>
                <span className="text-[11px] text-zinc-500 font-sans">Победа над соперником, стоящим ниже в таблице</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">+5 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04]">
              <div>
                <span className="text-zinc-200 font-bold block">Поражение: клану выше рейдера в рейтинге</span>
                <span className="text-[11px] text-zinc-500 font-sans">Проигрыш в онлайн-рейде более сильному составу</span>
              </div>
              <span className="text-rose-400 font-bold text-sm shrink-0 ml-3">-5 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04]">
              <div>
                <span className="text-zinc-200 font-bold block">Поражение: клану ниже рейдера в рейтинге</span>
                <span className="text-[11px] text-zinc-500 font-sans">Проигрыш в онлайн-рейде клану ниже по рейтингу</span>
              </div>
              <span className="text-rose-400 font-bold text-sm shrink-0 ml-3">-10 CRL</span>
            </div>
          </div>
        </div>

        {/* Card 2: Крейты и рекорды */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold">
            <Flame className="w-4 h-4" />
            <span>02 // КРЕЙТЫ И РЕКОРДЫ РАКЕТ</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Бонусы за динамичную карту, взятие контейнеров и масштабные осады.
          </p>
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.015]">
              <div>
                <span className="text-zinc-200 font-bold block">Забирание крейта</span>
                <span className="text-[11px] text-zinc-500 font-sans">
                  Успешный захват и лут крейта при активном онлайне сервера
                </span>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">+5 CRL</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.015]">
              <div>
                <span className="text-zinc-200 font-bold block">Рекорды ракет</span>
                <span className="text-[11px] text-zinc-500 font-sans">Установление подтвержденного рекорда по ракетам при рейде</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 ml-3">+10 CRL</span>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] text-[11px] text-amber-300 font-sans leading-relaxed">
              <b>Важно по крейтам:</b> Открытие крейтов при низком онлайне сервера не засчитывается командой модераторов.
            </div>
          </div>
        </div>

        {/* Card 3: Лимит 1000 CRL и Тай-брейк */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>03 // ТАЙ-БРЕЙК И ЛИМИТ 1 000 CRL</span>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center justify-between text-zinc-200 font-bold">
                <span>ПРАВИЛО ПЕРВЕНСТВА (ТАЙ-БРЕЙК)</span>
                <span className="text-amber-400 font-bold">1 000 CRL</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                Если два клана набирают по 1 000 CRL (максимум), выше в таблице располагается тот, у кого 1 000 очков стала раньше по времени.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center justify-between text-zinc-200 font-bold">
                <span>БИТВА ЗА ПЕРВОЕ МЕСТО (#2 VS #1)</span>
                <span className="text-rose-400">-10 CRL</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                Если клан второго места побеждает первое место, у лидера отнимается <b>-10 CRL</b> (становится 990 CRL) и он падает на вторую строчку, а победитель занимает первое место.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center justify-between text-zinc-200 font-bold">
                <span>СТАРТ НОВЫХ КОМАНД</span>
                <span className="text-zinc-400">0 CRL</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans mt-1">
                Каждый новый зарегистрированный клан стартует с 0 CRL и поднимается победами.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Жесткие запреты и проверка */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>04 // СТРОГИЕ ЗАПРЕТЫ И ПРОВЕРКА</span>
          </div>
          <div className="space-y-2.5 text-xs text-zinc-400 font-sans leading-relaxed">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <b>Офлайн-рейды не засчитываются:</b> Очки даются только за онлайн-рейды, когда защитники на сервере и обороняют базу.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <b>Подставные рейды строго запрещены:</b> Договорные сдачи, переливы и фиктивные рейды караются дисквалификацией и баном.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <b>Крейты при низком онлайне:</b> Захваты без конкуренции при полупустом сервере не принимаются.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                <b>Подача заявок и видеопруфы:</b> Заявки с видеозаписями направлять в наш{' '}
                <a
                  href="https://discord.gg/T2z57z68N9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 font-bold underline hover:text-indigo-300"
                >
                  Discord-сервер
                </a>{' '}
                или на почту{' '}
                <a
                  href="mailto:aresckoy@gmail.com?subject=Заявка%20в%20ладдер%20CRL"
                  className="text-white underline hover:text-zinc-300"
                >
                  aresckoy@gmail.com
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
