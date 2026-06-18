import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface TemplateGalleryProps {
  onClose: () => void;
  onTemplateCreated?: () => void;
}

export function TemplateGallery({ onClose, onTemplateCreated }: TemplateGalleryProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates = [
    { id: 'ola-mundo', name: 'Olá Mundo', language: 'Python', icon: '🐍', desc: 'Aprenda saída de dados básica.' },
    { id: 'calculadora', name: 'Calculadora', language: 'JavaScript', icon: '🧮', desc: 'Operações matemáticas simples.' },
    { id: 'turtle', name: 'Turtle Graphics', language: 'Python', icon: '🐢', desc: 'Desenhe na tela com tartaruga.' },
    { id: 'java', name: 'Main Class', language: 'Java', icon: '☕', desc: 'Estrutura básica de classe Java.' },
    { id: 'cpp', name: 'std::cout', language: 'C++', icon: '⚙️', desc: 'Entrada e saída padrão no C++.' },
    { id: 'go', name: 'fmt.Println', language: 'Go', icon: '🐹', desc: 'Primeiros passos com Go.' },
  ];

  const handleCreate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await invoke('create_edu_project', { templateId: id, projectName: 'projeto-edu' });
      onTemplateCreated?.();
      onClose();
    } catch (e) {
      console.error(e);
      setError('Erro ao criar projeto a partir do template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '500px',
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
          📂 Galeria de Templates
        </h3>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: '#aaa',
          fontSize: '18px',
          cursor: 'pointer'
        }}>✕</button>
      </div>

      {error && <div style={{ color: '#ff5252', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        maxHeight: '350px',
        overflowY: 'auto',
        paddingRight: '6px'
      }}>
        {templates.map((t) => (
          <div key={t.id} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{t.name}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#81c784', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {t.language}
              </div>
              <p style={{ fontSize: '11px', color: '#b0bec5', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                {t.desc}
              </p>
            </div>
            <button
              disabled={loading}
              onClick={() => handleCreate(t.id)}
              style={{
                width: '100%',
                padding: '6px 12px',
                background: '#4caf50',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Criar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
