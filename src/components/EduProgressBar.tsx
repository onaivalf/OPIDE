import React from 'react';
import { useGamification } from '../hooks/useGamification';

export function EduProgressBar() {
  const { stats } = useGamification();
  const xpInCurrentLevel = stats.xp % 100;
  const progressPercent = xpInCurrentLevel;

  return (
    <div style={{
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      margin: '10px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#81c784' }}>
          🎓 Nível {stats.level}
        </span>
        <span style={{ fontSize: '12px', color: '#b0bec5' }}>
          {stats.xp} XP total
        </span>
      </div>
      
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #4caf50, #81c784)',
          borderRadius: '4px',
          transition: 'width 0.4s ease-in-out'
        }} />
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: '#78909c',
        marginTop: '4px'
      }}>
        <span>{xpInCurrentLevel}/100 XP</span>
        <span>Próximo nível: {100 - xpInCurrentLevel} XP</span>
      </div>
    </div>
  );
}
