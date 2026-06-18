import React from 'react';
import { useGamification } from '../hooks/useGamification';

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const { leaderboard, loading } = useGamification();

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '400px',
      background: '#1e1e1e',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
      padding: '24px',
      zIndex: 10000,
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#ffeb3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏆 Leaderboard Local
        </h3>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: '#aaa',
          fontSize: '18px',
          cursor: 'pointer'
        }}>✕</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Carregando ranking...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {leaderboard.map((entry, index) => {
            const isSelf = entry.name.includes('(Você)');
            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: isSelf ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255,255,255,0.02)',
                border: isSelf ? '1px solid #4caf50' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '24px',
                    fontWeight: 'bold',
                    color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#888'
                  }}>
                    {index + 1}º
                  </span>
                  <span style={{ fontWeight: isSelf ? 'bold' : 'normal' }}>{entry.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                  <span style={{ color: '#81c784' }}>Nível {entry.level}</span>
                  <span style={{ color: '#b0bec5' }}>{entry.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
