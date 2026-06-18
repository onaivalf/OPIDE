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
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '240px',
          padding: '10px 16px',
          background: '#1e3c72',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 9999
        }}
      >
        👨‍🏫 Modo Apresentador
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '240px',
      background: '#1e1e1e',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999,
      color: '#fff',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffeb3b' }}>Apresentação:</span>
      
      <button onClick={decreaseZoom} style={btnStyle}>🔍-</button>
      <span style={{ fontSize: '12px' }}>{zoomLevel}%</span>
      <button onClick={increaseZoom} style={btnStyle}>🔍+</button>

      <button
        onClick={() => setLaserPointer(!isLaserPointer)}
        style={{
          ...btnStyle,
          background: isLaserPointer ? '#f44336' : 'rgba(255,255,255,0.05)'
        }}
      >
        🔴 Laser
      </button>

      <button
        onClick={() => setHighlightMode(!isHighlightMode)}
        style={{
          ...btnStyle,
          background: isHighlightMode ? '#4caf50' : 'rgba(255,255,255,0.05)'
        }}
      >
        ✏️ Destaque
      </button>

      <button onClick={togglePresenterMode} style={{ ...btnStyle, background: '#f44336' }}>
        Sair
      </button>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
