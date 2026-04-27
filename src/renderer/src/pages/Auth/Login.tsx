import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/Input/Input";
import { AuthService } from "../../services/auth.service";
import spectrumLogo from "../../assets/images/common/SpectrumLogo.png";
import styles from "./Auth.module.css";
import { GoogleLogin } from '@react-oauth/google';

export const Login: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('errorEmptyFields'));
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await AuthService.login({ email, password });

      navigate('/home');
    } catch (err: any) {
      const apiError = err.response?.data?.title || "loginError";
      setError(t(apiError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await AuthService.googleLogin({
        credential: credentialResponse.credential
      });

      console.log('Google login successful:', response);
      navigate('/home');
    } catch (err: any) {
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

          <button
            type="button"
            className={styles.adminAccessButton}
            onClick={() => navigate('/admin/my-profile')}
          >
          Ir al perfil de administrador
          </button>

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
