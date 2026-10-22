import React from 'react';
import { ListOrdered, Trophy, Flame, BookOpen, Handshake } from 'lucide-react';
import { TabId } from '../types';

interface TabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  raidsCount?: number;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onChange, raidsCount }) => {
  const tabs: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'ladder', label: 'Ладдер', icon: ListOrdered },
    { id: 'podium', label: 'Топ-3', icon: Trophy },
    { id: 'raids', label: 'Рейды', icon: Flame },
    { id: 'alliances', label: 'Альянсы', icon: Handshake },
    { id: 'rules', label: 'Регламент', icon: BookOpen },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl w-full sm:w-auto overflow-x-auto">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'bg-white text-black shadow-lg font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
            <span>{t.label}</span>
            {t.id === 'raids' && typeof raidsCount === 'number' && raidsCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-zinc-300'
                }`}
              >
                {raidsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
