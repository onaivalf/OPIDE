import React from 'react';
import { useGamification } from '../hooks/useGamification';

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const { leaderboard, loading } = useGamification();

  return (
    <div className="edu-modal-container">
      <div className="edu-modal-header">
        <h3 className="edu-modal-title yellow">
          🏆 Leaderboard Local
        </h3>
        <button onClick={onClose} className="edu-modal-close-btn">✕</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Carregando ranking...</div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => {
            const isSelf = entry.name.includes('(Você)');
            return (
              <div key={index} className={`leaderboard-item ${isSelf ? 'self-entry' : ''}`}>
                <div className="leaderboard-rank-col">
                  <span className={`leaderboard-rank rank-${index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : 'other'}`}>
                    {index + 1}º
                  </span>
                  <span style={{ fontWeight: isSelf ? 'bold' : 'normal' }}>{entry.name}</span>
                </div>
                <div className="leaderboard-stats-col">
                  <span className="leaderboard-level">Nível {entry.level}</span>
                  <span className="leaderboard-xp">{entry.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
