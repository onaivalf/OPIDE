import React, { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const ACHIEVEMENTS: Record<string, Achievement> = {
  first_run: { id: 'first_run', title: 'Primeiros Passos 🚀', description: 'Rodou um código pela primeira vez!', icon: '✨' },
  first_test: { id: 'first_test', title: 'Inspetor de Código 🔍', description: 'Executou testes no seu programa.', icon: '🧪' },
  explain_used: { id: 'explain_used', title: 'Buscador de Conhecimento 🤖', description: 'Pediu uma explicação para a Inteligência Artificial.', icon: '🧠' },
  level_2: { id: 'level_2', title: 'Aprendiz Proeminente 📈', description: 'Chegou ao Nível 2!', icon: '🌟' },
  level_3: { id: 'level_3', title: 'Mestre da Lógica 🏆', description: 'Chegou ao Nível 3!', icon: '👑' },
};

export function EduAchievementToast() {
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);

  useEffect(() => {
    const handleAchievement = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const achievementId = customEvent.detail;
      const achievement = ACHIEVEMENTS[achievementId] || {
        id: achievementId,
        title: 'Nova Conquista! 🎖️',
        description: 'Você desbloqueou um novo marco no OPIDE!',
        icon: '🎉'
      };

      setActiveToast(achievement);
      
      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('opide-achievement-unlocked', handleAchievement);
    return () => {
      window.removeEventListener('opide-achievement-unlocked', handleAchievement);
    };
  }, []);

  if (!activeToast) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      color: '#fff',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      zIndex: 100000,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      animation: 'slideUp 0.3s ease-out',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{ fontSize: '32px' }}>{activeToast.icon}</div>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px', color: '#ffeb3b' }}>
          {activeToast.title}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          {activeToast.description}
        </div>
      </div>
    </div>
  );
}
