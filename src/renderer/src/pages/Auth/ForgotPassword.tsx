import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input/Input';
import { AuthService } from '../../services/auth.service';
import spectrumLogo from '../../assets/images/common/SpectrumLogo.png';
import styles from './Auth.module.css';
import { getApiErrorKey } from './auth-flow.utils';

export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null; message: string }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!email) {
      setStatus({ type: 'error', message: t('emailRequired') });
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.forgotPassword(email);
      setStatus({ type: 'success', message: t('passwordResetInstructionsSent') });
      setStep('code');
    } catch (error) {
      setStatus({ type: 'error', message: t(getApiErrorKey(error, 'passwordResetRequestError')) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!email || !code) {
      setStatus({ type: 'error', message: t('errorEmptyFields') });
      return;
    }

    try {
      setIsLoading(true);
      const response = await AuthService.verifyPasswordResetCode({ email, code });
      navigate('/reset-password', { state: { email, verificationToken: response.verificationToken }, replace: true });
    } catch (error) {
      setStatus({ type: 'error', message: t(getApiErrorKey(error, 'verificationError')) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>
        <div className={styles.formSide}>
          <h1 className={styles.title}>{t('forgotPasswordTitle')}</h1>

          {status.message && (
            <div className={status.type === 'success' ? styles.successMessage : styles.errorMessage}>
              {status.message}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestCode}>
              <Input
                label={t('emailLabel')}
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? '...' : t('buttonSendCode')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
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
          )}

          <p className={styles.switchLink}>
            <span className={styles.accentText} onClick={() => navigate('/login')}>
              {t('buttonLogin')}
            </span>
          </p>
        </div>

        <div className={styles.brandSide}>
          <img src={spectrumLogo} alt="Spectrum Logo" className={styles.brandLogo} />
          <h2 className={styles.brandText}>{t('passwordRecoveryBrandText')}</h2>
        </div>
      </div>
    </div>
  );
};
