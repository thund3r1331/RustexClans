import React, { useState, useEffect, useCallback } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { Navbar } from './components/Navbar';
import { Tabs } from './components/Tabs';
import { LadderView } from './components/LadderView';
import { PodiumView } from './components/PodiumView';
import { RaidsView } from './components/RaidsView';
import { RulesView } from './components/RulesView';
import { ClanDetailModal } from './components/ClanDetailModal';
import { AdjustModal } from './components/AdjustModal';
import { CreateClanModal } from './components/CreateClanModal';
import { LoginModal } from './components/LoginModal';
import { ApplyModal } from './components/ApplyModal';
import { Clan, RatingLog, User, TabId } from './types';
import { Trophy, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [clans, setClans] = useState<Clan[]>([]);
  const [raids, setRaids] = useState<RatingLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabId>('ladder');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');

  // Modals state
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [clanForAdjust, setClanForAdjust] = useState<Clan | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isApplyOpen, setIsApplyOpen] = useState<boolean>(false);

  // Auth state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rustex_token'));
  const [user, setUser] = useState<User | null>(null);

  // Fetch leaderboard data
  const fetchClans = useCallback(async () => {
    try {
      let url = '/api/v1/leaderboard';
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTier) params.append('tier', selectedTier);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setClans(data);
      }
    } catch (err) {
      console.error('Failed to load clans', err);
    }
  }, [searchQuery, selectedTier]);

  // Fetch raids logs
  const fetchRaids = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/audit/rating-logs?limit=30');
      if (res.ok) {
        const data = await res.json();
        setRaids(data);
      }
    } catch (err) {
      console.error('Failed to load raids', err);
    }
  }, []);

  // Check auth user
  const checkAuth = useCallback(async (jwt: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const usr = await res.json();
        setUser(usr);
      } else {
        localStorage.removeItem('rustex_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('rustex_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      checkAuth(token);
    }
  }, [token, checkAuth]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchClans(), fetchRaids()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchClans, fetchRaids]);

  // Секретная комбинация "zxce" для открытия окна входа модератора
  useEffect(() => {
    const seq = [
      { code: 'KeyZ', en: 'z', ru: 'я' },
      { code: 'KeyX', en: 'x', ru: 'ч' },
      { code: 'KeyC', en: 'c', ru: 'с' },
      { code: 'KeyE', en: 'e', ru: 'у' },
    ];
    let currentIdx = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const expected = seq[currentIdx];
      const key = e.key.toLowerCase();
      const matches =
        e.code === expected.code || key === expected.en || key === expected.ru;

      if (matches) {
        currentIdx++;
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          currentIdx = 0;
        }, 2500);

        if (currentIdx === seq.length) {
          currentIdx = 0;
          if (resetTimer) clearTimeout(resetTimer);
          setIsLoginOpen(true);
        }
      } else {
        const first = seq[0];
        if (e.code === first.code || key === first.en || key === first.ru) {
          currentIdx = 1;
          if (resetTimer) clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            currentIdx = 0;
          }, 2500);
        } else {
          currentIdx = 0;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  const handleLoginSuccess = (jwt: string, usr: User) => {
    localStorage.setItem('rustex_token', jwt);
    setToken(jwt);
    setUser(usr);
  };

  const handleLogout = () => {
    localStorage.removeItem('rustex_token');
    setToken(null);
    setUser(null);
  };

  const top1Clan = clans[0];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Background Star Canvas */}
      <ParticleCanvas />

      {/* Navigation Topbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenCreateClan={() => setIsCreateOpen(true)}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* 01 // HERO BENTO OVERVIEW */}
        <section className="bento-card p-6 sm:p-8 lg:p-10 overflow-hidden relative group">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/[0.03] blur-3xl pointer-events-none group-hover:bg-white/[0.06] transition-all duration-500"></div>

          {/* Eyebrow */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-zinc-500 gap-2 mb-6 sm:mb-8 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                01 // RUSTEX REMAKE LADDER
              </span>
              <span className="text-zinc-700">|</span>
              <span className="inline-flex items-center gap-1.5 text-zinc-400 text-[11px]">
                <Trophy className="w-3.5 h-3.5 text-zinc-400" />
                <span>CLAN RANKING</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-zinc-400 uppercase">
                НЕПРЕРЫВНЫЙ СЕЗОН
              </span>
              <button
                onClick={() => {
                  fetchClans();
                  fetchRaids();
                }}
                className="p-1 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition cursor-pointer"
                title="Обновить данные"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Hero Main Content */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                Рейтинг кланов Rustex
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                Соревновательный ладдер. Корректировка очков производится командой модераторов на основе рейдов и активности.
              </p>
            </div>

            {/* Quick Summary Stats */}
            <div className="grid grid-cols-3 gap-3 w-full sm:w-auto shrink-0 font-mono text-xs">
              <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center min-w-[105px]">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">КЛАНОВ</span>
                <span className="text-2xl font-bold text-white tabular-nums">{clans.length}</span>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center min-w-[105px]">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">ТОП-1 CRL</span>
                <span className="text-2xl font-bold text-white tabular-nums">
                  {top1Clan?.points ? top1Clan.points.toLocaleString('ru-RU') : '-'}
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center min-w-[105px]">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">РЕЙДОВ</span>
                <span className="text-2xl font-bold text-white tabular-nums">{raids.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 02 // NAVIGATION TABS */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            raidsCount={raids.length}
          />
        </section>

        {/* 03 // ACTIVE TAB CONTENT */}
        <section className="min-h-[420px]">
          {activeTab === 'ladder' && (
            <LadderView
              clans={clans}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
              user={user}
              onSelectClan={(c) => setSelectedClan(c)}
              onOpenAdjust={(c) => setClanForAdjust(c)}
            />
          )}

          {activeTab === 'podium' && (
            <PodiumView
              clans={clans}
              onSelectClan={(c) => setSelectedClan(c)}
            />
          )}

          {activeTab === 'raids' && (
            <RaidsView logs={raids} loading={loading} />
          )}

          {activeTab === 'rules' && <RulesView />}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-white/[0.06] text-xs font-mono text-zinc-600 flex items-center justify-between gap-3 w-full">
        <div>
          <span className="text-zinc-400 font-semibold">RCL</span> • Clan Rankings
        </div>
      </footer>

      {/* MODALS */}
      {selectedClan && (
        <ClanDetailModal
          clan={selectedClan}
          onClose={() => setSelectedClan(null)}
          onOpenAdjust={(c) => setClanForAdjust(c)}
          isModerator={!!user}
        />
      )}

      {clanForAdjust && (
        <AdjustModal
          clan={clanForAdjust}
          token={token}
          onClose={() => setClanForAdjust(null)}
          onSuccess={() => {
            fetchClans();
            fetchRaids();
          }}
        />
      )}

      {isCreateOpen && (
        <CreateClanModal
          token={token}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            fetchClans();
          }}
        />
      )}

      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {isApplyOpen && (
        <ApplyModal onClose={() => setIsApplyOpen(false)} />
      )}
    </div>
  );
};
