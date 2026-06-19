import React from 'react';
import { usePresenterMode } from '../hooks/usePresenterMode';

export function PresenterMode() {
  const {
    isActive,
    zoomLevel,
    isLaserPointer,
    isHighlightMode,
    togglePresenterMode,
    increaseZoom,
    decreaseZoom,
    setLaserPointer,
    setHighlightMode
  } = usePresenterMode();

  if (!isActive) {
    return (
      <button
        onClick={togglePresenterMode}
        className="presenter-toggle-trigger"
      >
        👨‍🏫 Modo Apresentador
      </button>
    );
  }

  return (
    <div className="presenter-control-panel">
      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffeb3b' }}>Apresentação:</span>
      
      <button onClick={decreaseZoom} className="presenter-btn">🔍-</button>
      <span style={{ fontSize: '12px' }}>{zoomLevel}%</span>
      <button onClick={increaseZoom} className="presenter-btn">🔍+</button>

      <button
        onClick={() => setLaserPointer(!isLaserPointer)}
        className={`presenter-btn ${isLaserPointer ? 'laser-active' : ''}`}
      >
        🔴 Laser
      </button>

      <button
        onClick={() => setHighlightMode(!isHighlightMode)}
        className={`presenter-btn ${isHighlightMode ? 'highlight-active' : ''}`}
      >
        ✏️ Destaque
      </button>

      <button onClick={togglePresenterMode} className="presenter-btn exit-btn">
        Sair
      </button>
    </div>
  );
}
