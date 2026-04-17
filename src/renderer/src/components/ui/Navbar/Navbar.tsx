import { useTranslation } from 'react-i18next';
import { NavButton } from '../NavButton';
import styles from './Navbar.module.css';

export const Navbar = () => {
  const { t } = useTranslation('navbar');
  const username = "AbrahamC13"; // Esto vendrá de tu estado global luego

  return (
    <header className={styles.navbarContainer}>
      {/* NIVEL SUPERIOR: Identidad y Usuario */}
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <h1 className={styles.logoText}>SPECTRUM</h1>
        </div>

        <div className={styles.userSection}>
          <span className={styles.greeting}>
            {t('greeting', { name: username })}
          </span>
          <button className={styles.profileBtn}>
            <div className={styles.profileCircle}>
              {/* Aquí iría la foto real del usuario */}
            </div>
          </button>
        </div>
      </div>

      {/* NIVEL INFERIOR: Navegación */}
      <nav className={styles.navBar}>
        <NavButton label={t('nav.home')} />
        <NavButton label={t('nav.games')} />
        <NavButton label={t('nav.trending')} />
        <NavButton label={t('nav.clips')} />
        <NavButton label={t('nav.cripta')} isCripta={true} />
      </nav>
    </header>
  );
};
