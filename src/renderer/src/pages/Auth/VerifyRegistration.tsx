import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input/Input';
import { AuthService } from '../../services/auth.service';
import spectrumLogo from '../../assets/images/common/SpectrumLogo.png';
import styles from './Auth.module.css';
import { getApiErrorKey, routeUserByRole } from './auth-flow.utils';

export const VerifyRegistration: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null; message: string }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!email || !code) {
      setStatus({ type: 'error', message: t('errorEmptyFields') });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ type: null, message: '' });
      const response = await AuthService.verifyRegistration({ email, code });
      routeUserByRole(response.role, navigate);
    } catch (error) {
      setStatus({ type: 'error', message: t(getApiErrorKey(error, 'verificationError')) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (): Promise<void> => {
    if (!email) {
      setStatus({ type: 'error', message: t('emailRequired') });
      return;
    }

    try {
      setIsResending(true);
      await AuthService.resendRegistrationCode(email);
      setStatus({ type: 'success', message: t('verificationCodeSent') });
    } catch (error) {
      setStatus({ type: 'error', message: t(getApiErrorKey(error, 'resendCodeError')) });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>
        <div className={styles.formSide}>
          <h1 className={styles.title}>{t('verifyRegisterTitle')}</h1>

          {status.message && (
            <div className={status.type === 'success' ? styles.successMessage : styles.errorMessage}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <Input
              label={t('emailLabel')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label={t('verificationCodeLabel')}
              type="text"
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? '...' : t('buttonVerify')}
            </button>
          </form>

          <button type="button" className={styles.secondaryButton} onClick={handleResend} disabled={isResending}>
            {isResending ? '...' : t('buttonResendCode')}
          </button>

          <p className={styles.switchLink}>
            <span className={styles.accentText} onClick={() => navigate('/login')}>
              {t('buttonLogin')}
            </span>
          </p>
        </div>

        <div className={styles.brandSide}>
          <img src={spectrumLogo} alt="Spectrum Logo" className={styles.brandLogo} />
          <h2 className={styles.brandText}>{t('verificationBrandText')}</h2>
        </div>
      </div>
    </div>
  );
};
