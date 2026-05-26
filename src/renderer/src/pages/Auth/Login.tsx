import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/Input/Input";
import { AuthService } from "../../services/auth.service";
import spectrumLogo from "../../assets/images/common/SpectrumLogo.png";
import styles from "./Auth.module.css";
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { getApiErrorKey, routeUserByRole } from './auth-flow.utils';

export const Login: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('errorEmptyFields'));
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await AuthService.login({ email, password });
      routeUserByRole(response.role, navigate);
    } catch (err: unknown) {
      setError(t(getApiErrorKey(err, 'loginError')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse): Promise<void> => {
    if (!credentialResponse.credential) {
      setError(t('googleLoginError') || t('loginError'));
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
      setError(t('googleLoginError') || t('loginError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>

        <div className={styles.formSide}>
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
              {isLoading ? "..." : t('buttonLogin')}
            </button>
          </form>

          <button
            type="button"
            className={styles.linkButton}
            onClick={() => navigate('/forgot-password')}
          >
            {t('forgotPasswordLink')}
          </button>

          <div className={styles.divider}>O</div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError(t('googleLoginError') || t('loginError'))}
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
