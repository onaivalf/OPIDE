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
    <div className="edu-modal-container edu-modal-container-wide">
      <div className="edu-modal-header">
        <h3 className="edu-modal-title yellow">
          📂 Galeria de Templates
        </h3>
        <button onClick={onClose} className="edu-modal-close-btn">✕</button>
      </div>

      {error && <div className="edu-modal-error">{error}</div>}

      <div className="gallery-grid">
        {templates.map((t) => (
          <div key={t.id} className="gallery-card">
            <div>
              <div className="gallery-card-header">
                <span className="gallery-card-icon">{t.icon}</span>
                <span className="gallery-card-title">{t.name}</span>
              </div>
              <div className="gallery-card-lang">
                {t.language}
              </div>
              <p className="gallery-card-desc">
                {t.desc}
              </p>
            </div>
            <button
              disabled={loading}
              onClick={() => handleCreate(t.id)}
              className="gallery-card-btn"
            >
              Criar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
