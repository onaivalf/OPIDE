import { invoke } from '@tauri-apps/api/core';

export interface PlayerStats {
  xp: number;
  level: number;
  achievements: string[];
}

export interface LeaderboardEntry {
  name: string;
  xp: number;
  level: number;
}

export async function getPlayerStats(): Promise<PlayerStats> {
  try {
    return await invoke<PlayerStats>('get_player_stats');
  } catch (error) {
    console.error('Failed to get player stats:', error);
    return { xp: 0, level: 1, achievements: [] };
  }
}

export async function addXp(amount: number): Promise<PlayerStats> {
  try {
    const stats = await invoke<PlayerStats>('add_xp', { amount });
    // Dispatch custom event so UI components know stats updated
    window.dispatchEvent(new CustomEvent('opide-xp-updated', { detail: stats }));
    return stats;
  } catch (error) {
    console.error('Failed to add XP:', error);
    return { xp: 0, level: 1, achievements: [] };
  }
}

export async function unlockAchievement(id: string): Promise<PlayerStats> {
  try {
    const stats = await invoke<PlayerStats>('unlock_achievement', { id });
    window.dispatchEvent(new CustomEvent('opide-xp-updated', { detail: stats }));
    window.dispatchEvent(new CustomEvent('opide-achievement-unlocked', { detail: id }));
    return stats;
  } catch (error) {
    console.error('Failed to unlock achievement:', error);
    return { xp: 0, level: 1, achievements: [] };
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    return await invoke<LeaderboardEntry[]>('get_leaderboard');
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return [];
  }
}
