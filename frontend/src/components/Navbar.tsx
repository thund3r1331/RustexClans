import React from 'react';
import { Plus, LogOut, MessageSquare } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenCreateClan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenCreateClan,
}) => {
  return (
    <header className="relative z-20 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400/40"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <span className="font-bold text-white tracking-tight text-sm font-mono">
            RCL
          </span>
        </div>

        {/* Auth & Discord actions */}
        <div className="flex items-center gap-3 font-mono text-[11px]">

          {/* Кнопка подачи заявки в Discord */}
          <a
            href="https://discord.gg/T2z57z68N9"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-[#5865F2]/20 hover:border-[#5865F2]/40 transition cursor-pointer text-xs font-sans font-medium"
            title="Подать заявку в Discord (https://discord.gg/T2z57z68N9)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Подать заявку</span>
          </a>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[10px] text-zinc-300">
                {user.username} ({user.role})
              </span>

              <button
                onClick={onOpenCreateClan}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition shadow cursor-pointer font-sans"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Клан</span>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-rose-400 text-xs transition cursor-pointer"
                title="Выйти"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
