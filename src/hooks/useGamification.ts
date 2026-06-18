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
    fetchStats();

    const handleXpUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PlayerStats>;
      setStats(customEvent.detail);
      // Refresh leaderboard when XP updates
      getLeaderboard().then(setLeaderboard);
    };

    window.addEventListener('opide-xp-updated', handleXpUpdate);
    return () => {
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
