import React from 'react';
import { useGamification } from '../hooks/useGamification';

export function EduProgressBar() {
  const { stats } = useGamification();
  const xpInCurrentLevel = stats.xp % 100;
  const progressPercent = xpInCurrentLevel;

  return (
    <div className="edu-progress-container">
      <div className="edu-progress-header">
        <span className="edu-progress-level">
          🎓 Nível {stats.level}
        </span>
        <span className="edu-progress-xp-total">
          {stats.xp} XP total
        </span>
      </div>
      
      <div className="edu-progress-track">
        <div
          className="edu-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="edu-progress-footer">
        <span>{xpInCurrentLevel}/100 XP</span>
        <span>Próximo nível: {100 - xpInCurrentLevel} XP</span>
      </div>
    </div>
  );
}
