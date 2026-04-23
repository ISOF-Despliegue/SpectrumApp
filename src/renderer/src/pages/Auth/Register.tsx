import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/Input/Input";
import { AuthService } from "../../services/auth.service";
import spectrumLogo from "../../assets/images/common/SpectrumLogo.png";
import styles from "./Auth.module.css";

export const Register: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError(t('errorEmptyFields'));
      return;
    }
    if (password.length < 8) {
      setError(t('errorShortPassword'));
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await AuthService.register({ username, email, password });
      navigate('/home');
    } catch (err: any) {
      const apiError = err.response?.data?.title;
      setError(t(apiError) || t('registrationError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>

        <div className={styles.formSide}>
          <h1 className={styles.title}>{t('registerTitle')}</h1>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label={t('usernameLabel')}
              type="text"
              placeholder={t('usernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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
              {isLoading ? "..." : t('buttonRegister')}
            </button>
          </form>

          <p className={styles.switchLink}>
            {t('haveAccount')}
            <span className={styles.accentText} onClick={() => navigate('/login')}>
              {t('buttonLogin')}
            </span>
          </p>
        </div>

        <div className={styles.brandSide}>
          <img src={spectrumLogo} alt="Spectrum Logo" className={styles.brandLogo} />
          <h2 className={styles.brandText}>{t('registrationBrandText')}</h2>
        </div>

      </div>
    </div>
  );
};
