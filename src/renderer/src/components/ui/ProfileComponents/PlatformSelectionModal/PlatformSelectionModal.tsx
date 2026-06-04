import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassContainer } from '../../GlassContainer/GlassContainer';
import { ActionButton } from '../../ActionButton/ActionButton';
import styles from './PlatformSelectionModal.module.css';
import { AVAILABLE_PLATFORMS } from './platformAssets';

interface ProfilePlatform {
  id: number;
  name: string;
}

interface PlatformSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedPlatforms: ProfilePlatform[]) => void;
  initialPlatforms: ProfilePlatform[];
}

/// <summary>
/// Modal component that allows users to toggle their preferred gaming platforms.
/// Updates the local profile state before the final persistence call.
/// </summary>
export const PlatformSelectionModal: React.FC<PlatformSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlatforms
}) => {
  const { t } = useTranslation('profile');
  const [selected, setSelected] = useState<ProfilePlatform[]>(initialPlatforms);

  if (!isOpen) return null;

  /// <summary>
  /// Toggles the selection status of a platform in the local modal state.
  /// </summary>
  const togglePlatform = (platform: ProfilePlatform): void => {
    const isAlreadySelected = selected.some(p => p.id === platform.id);
    if (isAlreadySelected) {
      setSelected(selected.filter(p => p.id !== platform.id));
    } else {
      setSelected([...selected, platform]);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <GlassContainer className={styles.modalContent}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t('labels.platforms')}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className={styles.platformGrid}>
          {AVAILABLE_PLATFORMS.map((platform) => {
            const isActive = selected.some(s => s.id === platform.id);
            return (
              <div
                key={platform.id}
                className={`${styles.platformCard} ${isActive ? styles.active : ''}`}
                onClick={() => togglePlatform({ id: platform.id, name: platform.name })}
              >
                <div className={styles.iconWrapper}>
                  <img src={platform.icon} alt={platform.name} className={styles.platformIcon} />
                </div>
                <span className={styles.platformName}>{platform.name}</span>
                {isActive && <div className={styles.checkMark}>✓</div>}
              </div>
            );
          })}
        </div>

        <footer className={styles.modalFooter}>
          <ActionButton variant="save" onClick={() => onSave(selected)}>
            {t('actions.save')}
          </ActionButton>
          <ActionButton variant="cancel" onClick={onClose}>
            {t('actions.cancel')}
          </ActionButton>
        </footer>
      </GlassContainer>
    </div>
  );
};
