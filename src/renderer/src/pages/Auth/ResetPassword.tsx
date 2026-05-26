import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input/Input';
import { AuthService } from '../../services/auth.service';
import spectrumLogo from '../../assets/images/common/SpectrumLogo.png';
import styles from './Auth.module.css';
import { getApiErrorKey, isStrongPassword } from './auth-flow.utils';

export const ResetPassword: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; verificationToken?: string } | null;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null; message: string }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!state?.email || !state.verificationToken) {
      navigate('/forgot-password', { replace: true });
      return;
    }

    if (!newPassword || !confirmPassword) {
      setStatus({ type: 'error', message: t('errorEmptyFields') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: t('passwordMismatch') });
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setStatus({ type: 'error', message: t('passwordPolicy') });
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.resetPassword({
        email: state.email,
        verificationToken: state.verificationToken,
        newPassword
      });
      setStatus({ type: 'success', message: t('passwordUpdated') });
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    } catch (error) {
      setStatus({ type: 'error', message: t(getApiErrorKey(error, 'passwordResetError')) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>
        <div className={styles.formSide}>
          <h1 className={styles.title}>{t('resetPasswordTitle')}</h1>

          {status.message && (
            <div className={status.type === 'success' ? styles.successMessage : styles.errorMessage}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleReset}>
            <Input
              label={t('passwordLabel')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <Input
              label={t('confirmPasswordLabel')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? '...' : t('buttonResetPassword')}
            </button>
          </form>
        </div>

        <div className={styles.brandSide}>
          <img src={spectrumLogo} alt="Spectrum Logo" className={styles.brandLogo} />
          <h2 className={styles.brandText}>{t('passwordRecoveryBrandText')}</h2>
        </div>
      </div>
    </div>
  );
};
