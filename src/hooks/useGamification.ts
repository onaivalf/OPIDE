import { useState, useEffect } from 'react';
import { getPlayerStats, addXp, unlockAchievement, getLeaderboard, PlayerStats, LeaderboardEntry } from '../services/edu-progress';

export function useGamification() {
  const [stats, setStats] = useState<PlayerStats>({ xp: 0, level: 1, achievements: [] });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const s = await getPlayerStats();
    setStats(s);
    const l = await getLeaderboard();
    setLeaderboard(l);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      const s = await getPlayerStats();
      if (!isMounted) return;
      setStats(s);
      const l = await getLeaderboard();
      if (!isMounted) return;
      setLeaderboard(l);
      setLoading(false);
    };

    fetchInitial();

    const handleXpUpdate = (e: Event) => {
      if (!isMounted) return;
      const customEvent = e as CustomEvent<PlayerStats>;
      setStats(customEvent.detail);
      // Refresh leaderboard when XP updates
      getLeaderboard().then((l) => { if (isMounted) setLeaderboard(l); });
    };

    window.addEventListener('opide-xp-updated', handleXpUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('opide-xp-updated', handleXpUpdate);
    };
  }, []);

  const gainXp = async (amount: number) => {
    return await addXp(amount);
  };

  const triggerAchievement = async (id: string) => {
    return await unlockAchievement(id);
  };

  return {
    stats,
    leaderboard,
    loading,
    gainXp,
    triggerAchievement,
    refresh: fetchStats
  };
}
