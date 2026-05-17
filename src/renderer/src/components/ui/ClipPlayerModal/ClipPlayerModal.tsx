import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ClipPlayerModal.module.css';

/**
 * Interface defining the properties for the ClipPlayerModal component.
 * @property {string} videoUrl - The direct URL of the video resource to be played.
 * @property {string} title - The title text of the media clip.
 * @property {string} [gameName] - Optional associated video game title for context.
 * @property {boolean} isOpen - Conditional flag controlling the modal overlay display.
 * @property {function} onClose - Callback invoked to handle modal dismissal workflows.
 */
interface ClipPlayerModalProps {
  videoUrl: string;
  title: string;
  gameName?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ClipPlayerModal component renders an immersive overlay housing an HTML5 native video player.
 * Supports keyboard accessibility listeners and outer backdrop click dismissals using CSS Modules.
 */
export const ClipPlayerModal: React.FC<ClipPlayerModalProps> = ({
  videoUrl,
  title,
  gameName,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      videoRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  /**
   * Evaluates if the click occurred directly on the background backdrop layer to trigger closure.
   * @param {React.MouseEvent<HTMLDivElement>} event - The mouse click gesture event.
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        {/* Header container displaying titles and closure trigger */}
        <div className={styles.modalHeader}>
          <div className={styles.titleMetadata}>
            <h3 className={styles.modalTitle}>{title}</h3>
            {gameName && <span className={styles.gameTag}>{gameName}</span>}
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('profile:actions.close') || 'Close'}
          >
            ×
          </button>
        </div>

        {/* Immersive video display container wrapping native HTML5 engine */}
        <div className={styles.videoPlayerWrapper}>
          <video
            ref={videoRef}
            src={videoUrl}
            className={styles.nativeVideoPlayer}
            controls
            autoPlay
          >
            {t('common:status.loading')}
          </video>
            </div>
          </div>
        </div>
  );
};
