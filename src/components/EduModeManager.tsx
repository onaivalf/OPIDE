import React, { useState, useEffect } from 'react';
import { EduToggle, isEduMode } from './EduToggle';
import { EduActionBar } from './EduActionBar';
import { EduProgressBar } from './EduProgressBar';
import { EduAchievementToast } from './EduAchievementToast';
import { TemplateGallery } from './TemplateGallery';
import { Leaderboard } from './Leaderboard';
import { LMSExportPanel } from './LMSExportPanel';
import { PresenterMode } from './PresenterMode';

export function EduModeManager() {
  const [eduActive, setEduActive] = useState<boolean>(isEduMode());
  const [activeModal, setActiveModal] = useState<'templates' | 'leaderboard' | 'lms' | null>(null);

  useEffect(() => {
    // Sync the attribute with document element on initial load
    document.documentElement.setAttribute('data-edu-mode', String(eduActive));
  }, [eduActive]);

  const handleModeChange = (isEdu: boolean) => {
    setEduActive(isEdu);
    document.documentElement.setAttribute('data-edu-mode', String(isEdu));
  };

  const handleActionClick = (actionId: string) => {
    if (actionId === 'templates') {
      setActiveModal('templates');
    } else if (actionId === 'leaderboard') {
      setActiveModal('leaderboard');
    } else if (actionId === 'lms') {
      setActiveModal('lms');
    }
  };

  return (
    <div className="edu-mode-manager-container">
      {/* Floating Toggle always visible in top-right */}
      <div className="edu-floating-toggle">
        <EduToggle onModeChange={handleModeChange} />
      </div>

      {eduActive && (
        <>
          {/* Action Bar floating bottom-right */}
          <EduActionBar onActionClick={handleActionClick} />

          {/* Progress Bar floating bottom-left */}
          <div className="edu-floating-progress">
            <EduProgressBar />
          </div>

          {/* Presenter Mode floating control */}
          <PresenterMode />

          {/* Achievement Toast */}
          <EduAchievementToast />

          {/* Modals overlay */}
          {activeModal && (
            <div className="edu-modal-overlay" onClick={() => setActiveModal(null)}>
              <div onClick={(e) => e.stopPropagation()}>
                {activeModal === 'templates' && (
                  <TemplateGallery onClose={() => setActiveModal(null)} />
                )}
                {activeModal === 'leaderboard' && (
                  <Leaderboard onClose={() => setActiveModal(null)} />
                )}
                {activeModal === 'lms' && (
                  <LMSExportPanel onClose={() => setActiveModal(null)} />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
