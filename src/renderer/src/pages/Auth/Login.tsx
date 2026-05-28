import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/Input/Input";
import { AuthService } from "../../services/auth.service";
import spectrumLogo from "../../assets/images/common/SpectrumLogo.png";
import styles from "./Auth.module.css";
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { getApiErrorKey, routeUserByRole } from './auth-flow.utils';
import { useToast } from '../../components/ui/Toast';

export const Login: React.FC = () => {
  const { t, i18n } = useTranslation('auth');
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const changeLanguage = async (language: string): Promise<void> => {
    await i18n.changeLanguage(language);
    localStorage.setItem('i18nextLng', language);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('errorEmptyFields'));
      toast.warning(t('errorEmptyFields'));
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await AuthService.login({ email, password });
      routeUserByRole(response.role, navigate);
    } catch (err: unknown) {
      const message = t(getApiErrorKey(err, 'loginError'));
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse): Promise<void> => {
    if (!credentialResponse.credential) {
      const message = t('googleLoginError') || t('loginError');
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await AuthService.googleLogin({
        credential: credentialResponse.credential
      });

      routeUserByRole(response.role, navigate);
    } catch {
      const message = t('googleLoginError') || t('loginError');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>

        <div className={styles.formSide}>
          <label className={styles.languageSelector}>
            <span>{t('languageLabel')}</span>
            <select value={i18n.resolvedLanguage || 'es'} onChange={(event) => { void changeLanguage(event.target.value); }}>
              <option value="es">{t('languageSpanish')}</option>
              <option value="en">{t('languageEnglish')}</option>
            </select>
          </label>
          <h1 className={styles.title}>{t('loginTitle')}</h1>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label={t('emailLabel')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label={t('passwordLabel')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? t('loading') : t('buttonLogin')}
            </button>
          </form>

          <button
            type="button"
            className={styles.linkButton}
            onClick={() => navigate('/forgot-password')}
          >
            {t('forgotPasswordLink')}
          </button>

          <div className={styles.divider}>{t('dividerOr')}</div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                const message = t('googleLoginError') || t('loginError');
                setError(message);
                toast.error(message);
              }}
              useOneTap
              theme="filled_blue"
              shape="pill"
              text="continue_with"
            />
          </div>

          <p className={styles.switchLink}>
            {t('noAccount')}
            <span className={styles.accentText} onClick={() => navigate('/register')}>
              {t('buttonRegister')}
            </span>
          </p>
        </div>

        <div className={styles.brandSide}>
          <img src={spectrumLogo} alt="Spectrum Logo" className={styles.brandLogo} />
          <h2 className={styles.brandText}>{t('loginBrandText')}</h2>
        </div>

      </div>
    </div>
  );
};
