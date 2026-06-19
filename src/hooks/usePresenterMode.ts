import { useState, useEffect } from 'react';

export function usePresenterMode() {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isLaserPointer, setIsLaserPointer] = useState<boolean>(false);
  const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    // Aplica zoom via CSS transform no container principal (não altera rem global)
    const workbench = document.getElementById('workbench-container') ?? document.body;
    const scale = zoomLevel / 100;
    if (zoomLevel !== 100) {
      workbench.style.transform = `scale(${scale})`;
      workbench.style.transformOrigin = 'top left';
      workbench.style.width = `${100 / scale}%`;
      workbench.style.height = `${100 / scale}%`;
    } else {
      workbench.style.transform = '';
      workbench.style.transformOrigin = '';
      workbench.style.width = '';
      workbench.style.height = '';
    }
  }, [zoomLevel]);

  useEffect(() => {
    // Toggle class on document body for cursor style
    if (isLaserPointer) {
      document.body.classList.add('edu-laser-pointer');
    } else {
      document.body.classList.remove('edu-laser-pointer');
    }
  }, [isLaserPointer]);

  const togglePresenterMode = () => {
    const nextActive = !isActive;
    setIsActive(nextActive);
    if (!nextActive) {
      // Reset defaults
      setZoomLevel(100);
      setIsLaserPointer(false);
      setIsHighlightMode(false);
    }
  };

  const increaseZoom = () => setZoomLevel((prev) => Math.min(prev + 10, 200));
  const decreaseZoom = () => setZoomLevel((prev) => Math.max(prev - 10, 80));

  return {
    isActive,
    zoomLevel,
    isLaserPointer,
    isHighlightMode,
    togglePresenterMode,
    increaseZoom,
    decreaseZoom,
    setLaserPointer: setIsLaserPointer,
    setHighlightMode: setIsHighlightMode
  };
}
