import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassContainer } from '../../GlassContainer/GlassContainer';
import { ActionButton } from '../../ActionButton/ActionButton';
import { ProfileService } from '../../../../services/profile.service';
import styles from './PasswordChangeModal.module.css';
import { isStrongPassword } from '../../../../pages/Auth/auth-flow.utils';

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
    code: '',
    newPassword: '',
    confirmPassword: '',
    verificationToken: ''
  });
  const [step, setStep] = useState<'request' | 'code' | 'password'>('request');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null; message: string | null }>({
    type: null,
    message: null
  });

  useEffect(() => {
    if (!isOpen) {
      setData({ code: '', newPassword: '', confirmPassword: '', verificationToken: '' });
      setStep('request');
      setStatus({ type: null, message: null });
    }
  }, [isOpen]);

  const handleRequestCode = async (): Promise<void> => {
    setStatus({ type: null, message: null });
    setLoading(true);
    try {
      await ProfileService.requestPasswordChangeCode();
      setStep('code');
      setStatus({ type: 'success', message: t('messages.verificationCodeSent') });
    } catch {
      setStatus({ type: 'error', message: t('messages.updateError') });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    setStatus({ type: null, message: null });
    if (!data.code) {
      setStatus({ type: 'error', message: t('messages.fillFields') });
      return;
    }

    setLoading(true);
    try {
      const response = await ProfileService.verifyPasswordChangeCode(data.code);
      setData({ ...data, verificationToken: response.verificationToken });
      setStep('password');
      setStatus({ type: 'success', message: t('messages.codeVerified') });
    } catch {
      setStatus({ type: 'error', message: t('messages.invalidCode') });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (): Promise<void> => {
    setStatus({ type: null, message: null });

    if (!data.verificationToken || !data.newPassword || !data.confirmPassword) {
      setStatus({ type: 'error', message: t('messages.fillFields') });
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      setStatus({ type: 'error', message: t('messages.passwordMismatch') });
      return;
    }

    if (!isStrongPassword(data.newPassword)) {
      setStatus({ type: 'error', message: t('messages.passwordPolicy') });
      return;
    }

    setLoading(true);
    try {
      await ProfileService.confirmPasswordChange({
        verificationToken: data.verificationToken,
        newPassword: data.newPassword
      });

      setStatus({ type: 'success', message: t('messages.passwordUpdated') });

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch {
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

          {step === 'code' && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('labels.verificationCode')}</label>
              <input
                type="text"
                className={styles.passwordInput}
                value={data.code}
                onChange={(e) => setData({ ...data, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              />
            </div>
          )}

          {step === 'password' && (
            <>
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
            </>
          )}
        </div>

        <footer className={styles.modalFooter}>
          {step === 'request' && (
            <ActionButton variant="save" onClick={handleRequestCode} disabled={loading}>
              {loading ? '...' : t('actions.sendCode')}
            </ActionButton>
          )}
          {step === 'code' && (
            <ActionButton variant="save" onClick={handleVerifyCode} disabled={loading}>
              {loading ? '...' : t('actions.verifyCode')}
            </ActionButton>
          )}
          {step === 'password' && (
            <ActionButton variant="save" onClick={handleUpdate} disabled={loading}>
              {loading ? '...' : t('actions.save')}
            </ActionButton>
          )}
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
