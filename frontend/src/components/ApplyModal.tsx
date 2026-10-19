import React, { useState } from 'react';
import { X, Mail, Video, Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';

interface ApplyModalProps {
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const email = 'aresckoy@gmail.com';
  const emailSubject = 'Заявка на начисление CRL // Соревновательный ладдер';
  const emailTemplate = `1. Название и тег клана: [TAG] Название клана
2. Тип события (отметьте нужное):
   [ ] Победа: рейд клана выше рейтинга (+10 CRL)
   [ ] Победа: рейд клана ниже рейтинга (+5 CRL)
   [ ] Поражение: клану выше рейдера в рейтинге (-5 CRL)
   [ ] Поражение: клану ниже рейдера в рейтинге (-10 CRL)
   [ ] Забирание крейта (+5 CRL)
   [ ] Рекорды ракет (при рейде) (+10 CRL)
3. Против кого / локация (тег клана соперника или монумент): 
4. Ссылка на видеодоказательство (YouTube / Rutube / Twitch): https://...
5. Таймкоды ключевых моментов (шкаф, выбивание, лут крейта, ракеты): 
6. Состав клана на событии: Nick1, Nick2, Nick3
7. Подтверждение онлайна (онлайн-рейд, активная защита, не подставной): Да
8. Дополнительный комментарий:`;

  const copyToClipboard = (text: string, type: 'email' | 'template') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    }
  };

  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailTemplate)}`;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailTemplate)}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] bg-[#0c0d10] backdrop-blur-3xl shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white shrink-0">
            <Mail className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Подача заявки на рейтинг</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Фиксация онлайн-рейдов, крейтов и рекордов ракет
            </p>
          </div>
        </div>

        {/* Mandatory Proofs & Prohibitions Warning */}
        <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>ТРЕБОВАНИЯ И ЗАПРЕТЫ К ЗАЯВКЕ</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Для начисления очков обязательна видеозапись с таймкодами. <b>Офлайн-рейды не засчитываются</b>, подставные рейды строго запрещены, открытие крейтов при низком онлайне сервера не принимается.
          </p>
        </div>

        {/* Scoring Rules Quick Grid */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="uppercase">Регламент очков CRL:</span>
            <span className="text-emerald-400 font-bold">Лимит: 1 000 CRL</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <span className="text-zinc-400 text-[10px] block font-sans">Победа: рейд клана выше</span>
              <span className="text-emerald-400 font-bold text-xs">+10 CRL</span>
            </div>
            <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <span className="text-zinc-400 text-[10px] block font-sans">Победа: рейд клана ниже</span>
              <span className="text-emerald-400 font-bold text-xs">+5 CRL</span>
            </div>
            <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <span className="text-zinc-400 text-[10px] block font-sans">Поражение клану выше</span>
              <span className="text-rose-400 font-bold text-xs">-5 CRL</span>
            </div>
            <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <span className="text-zinc-400 text-[10px] block font-sans">Поражение клану ниже</span>
              <span className="text-rose-400 font-bold text-xs">-10 CRL</span>
            </div>
            <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <span className="text-zinc-400 text-[10px] block font-sans">Забирание крейта (онлайн)</span>
              <span className="text-emerald-400 font-bold text-xs">+5 CRL</span>
            </div>
            <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <span className="text-zinc-400 text-[10px] block font-sans">Рекорды ракет (при рейде)</span>
              <span className="text-emerald-400 font-bold text-xs">+10 CRL</span>
            </div>
          </div>
        </div>

        {/* Email Recipient box */}
        <div className="space-y-1.5 font-mono text-xs">
          <label className="block text-zinc-400 uppercase text-[11px]">Почта для отправки:</label>
          <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
            <span className="text-white font-bold text-sm">{email}</span>
            <button
              onClick={() => copyToClipboard(email, 'email')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition text-xs cursor-pointer font-sans"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Скопировано' : 'Скопировать'}</span>
            </button>
          </div>
        </div>

        {/* Template box */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <label className="block text-zinc-400 uppercase text-[11px]">Шаблон письма с пруфами:</label>
            <button
              onClick={() => copyToClipboard(emailTemplate, 'template')}
              className="text-zinc-400 hover:text-white transition text-[11px] flex items-center gap-1 cursor-pointer font-sans"
            >
              {copiedTemplate ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedTemplate ? 'Шаблон скопирован' : 'Скопировать шаблон'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl border border-white/[0.06] bg-black/60 text-zinc-400 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
            {emailTemplate}
          </pre>
        </div>

        {/* Fast Action Buttons */}
        <div className="space-y-2 pt-2">
          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition shadow-xl font-sans flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Открыть и отправить через Gmail</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>

          <a
            href={mailtoUrl}
            className="w-full py-2.5 rounded-full border border-white/15 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition text-xs font-sans flex items-center justify-center gap-2 cursor-pointer"
          >
            <Video className="w-4 h-4 text-zinc-400" />
            <span>Открыть в почтовой программе (mailto)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
