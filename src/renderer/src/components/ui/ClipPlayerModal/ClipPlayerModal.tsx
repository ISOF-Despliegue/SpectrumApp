import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ClipPlayerModal.module.css';

/**
 * Interface defining properties for the ClipPlayerModal immersive component.
 */
interface ClipPlayerModalProps {
  isOpen: boolean;
  videoUrl: string | undefined;
  title: string;
  gameName?: string;
  onClose: () => void;
}

/**
 * ClipPlayerModal overlays a cinematic bounding box over the dashboard to
 * stream native 16:9 MP4/MOV assets utilizing HTML5 engine specs.
 */
export const ClipPlayerModal: React.FC<ClipPlayerModalProps> = ({
  isOpen,
  videoUrl,
  title,
  gameName,
  onClose
}) => {
  const { t } = useTranslation(['profile']);

  // Listen for 'Escape' key to close the modal for better UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      {/* Click propagation stop prevents closing when clicking inside the player bounds */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.titleMetadata}>
            <h3 className={styles.modalTitle}>{title}</h3>
            {gameName && <span className={styles.gameTag}>{gameName}</span>}
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            title={t('profile:clips.player.closeBtnTooltip')}
          >
            &times;
          </button>
        </header>

        <div className={styles.videoPlayerWrapper}>
          <video
            className={styles.nativeVideoPlayer}
            src={videoUrl}
            controls
            autoPlay
            controlsList="nodownload"
            onEnded={onClose}
          >
            {t('profile:clips.player.notSupported')}
          </video>
        </div>
      </div>
    </div>
  );
};
