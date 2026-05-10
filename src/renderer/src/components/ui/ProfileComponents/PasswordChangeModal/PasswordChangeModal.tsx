import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassContainer } from '../../GlassContainer/GlassContainer';
import { ActionButton } from '../../ActionButton/ActionButton';
import { ProfileService } from '../../../../services/profile.service';
import styles from './PasswordChangeModal.module.css';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/// <summary>
/// Modal component for secure password updates.
/// Provides visual feedback for errors and success without using browser alerts.
/// </summary>
export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('profile');

  const [data, setData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null; message: string | null }>({
    type: null,
    message: null
  });

  useEffect(() => {
    if (!isOpen) {
      setData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus({ type: null, message: null });
    }
  }, [isOpen]);

  /// <summary>
  /// Handles the password update process and manages UI feedback messages.
  /// </summary>
  const handleUpdate = async () => {
    setStatus({ type: null, message: null });

    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      setStatus({ type: 'error', message: t('messages.fillFields') });
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      setStatus({ type: 'error', message: t('messages.passwordMismatch') });
      return;
    }

    setLoading(true);
    try {
      await ProfileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      setStatus({ type: 'success', message: t('messages.passwordUpdated') });

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: t('messages.updateError') });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <GlassContainer className={styles.modalContent}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t('labels.security')}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className={styles.modalBody}>
          {status.message && (
            <div className={`${styles.statusMessage} ${styles[status.type!]}`}>
              {status.message}
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t('labels.passwordCurrent')}</label>
            <input
              type="password"
              className={styles.passwordInput}
              value={data.currentPassword}
              onChange={(e) => setData({ ...data, currentPassword: e.target.value })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t('labels.passwordNew')}</label>
            <input
              type="password"
              className={styles.passwordInput}
              value={data.newPassword}
              onChange={(e) => setData({ ...data, newPassword: e.target.value })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t('labels.passwordConfirm')}</label>
            <input
              type="password"
              className={styles.passwordInput}
              value={data.confirmPassword}
              onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <ActionButton
            variant="save"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? '...' : t('actions.save')}
          </ActionButton>
          <ActionButton
            variant="cancel"
            onClick={onClose}
          >
            {t('actions.cancel')}
          </ActionButton>
        </footer>
      </GlassContainer>
    </div>
  );
};
