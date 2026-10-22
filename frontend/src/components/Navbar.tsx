import React from 'react';
import { Plus, LogOut, MessageSquare, LogIn, UserPlus, Shield, Users } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenCreateClan: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenAdminLeaders?: () => void;
  onOpenMyClan?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenCreateClan,
  onOpenLogin,
  onOpenRegister,
  onOpenAdminLeaders,
  onOpenMyClan,
}) => {
  const isAdmin = user?.role === 'admin';
  const isModerator = user && (user.role === 'admin' || user.role === 'moderator');
  const isLeader = user?.role === 'clan_leader';

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

        {/* Actions */}
        <div className="flex items-center gap-2 font-mono text-[11px]">

          {/* Discord — всегда видна */}
          <a
            href="https://discord.gg/T2z57z68N9"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-[#5865F2]/20 hover:border-[#5865F2]/40 transition cursor-pointer text-xs font-sans font-medium"
            title="Подать заявку в Discord"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Discord</span>
          </a>

          {user ? (
            <div className="flex items-center gap-2">
              {/* Бейдж пользователя */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[10px] text-zinc-300">
                {isModerator && <Shield className="w-3 h-3 text-amber-400" />}
                {isLeader && <Shield className="w-3 h-3 text-emerald-400" />}
                <span className="truncate max-w-[100px]">{user.username}</span>
                {isLeader && user.clan_id && (
                  <span className="text-emerald-400 font-semibold">· лидер</span>
                )}
                {isLeader && !user.clan_id && (
                  <span className="text-amber-400">· без клана</span>
                )}
              </span>

              {/* Мой клан — для лидера клана */}
              {isLeader && user.clan_id && onOpenMyClan && (
                <button
                  onClick={onOpenMyClan}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-xs transition shadow cursor-pointer font-sans"
                  title="Открыть карточку и состав моего клана"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Мой клан</span>
                </button>
              )}

              {/* Управление лидерами — только для администраторов */}
              {isAdmin && onOpenAdminLeaders && (
                <button
                  onClick={onOpenAdminLeaders}
                  className="flex items-center gap-1 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs transition shadow cursor-pointer font-sans"
                  title="Управление привязкой лидеров кланов"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Лидеры</span>
                </button>
              )}

              {/* Создать клан — для модераторов и админов */}
              {isModerator && (
                <button
                  onClick={onOpenCreateClan}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition shadow cursor-pointer font-sans"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Клан</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-rose-400 text-xs transition cursor-pointer"
                title="Выйти"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenRegister}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer text-xs font-sans font-medium"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Регистрация</span>
              </button>
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition cursor-pointer font-sans"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Войти</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
