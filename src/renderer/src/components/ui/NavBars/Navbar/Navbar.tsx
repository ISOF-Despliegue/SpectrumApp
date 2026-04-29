import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavButton } from '../NavButton';
import { ProfileImageNavbar } from '../ProfileImageNavbar';
import SpectrumLogo from '../../../../assets/images/common/SpectrumLogo.png';
import styles from './Navbar.module.css';

interface NavbarProps {
  hideNavigation?: boolean;
  onProfileClick: () => void;
}

export const Navbar = ({ hideNavigation = false, onProfileClick }: NavbarProps) => {
  const { t } = useTranslation('navbar');
  const username = "AbrahamC13";
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className={`${styles.navbarContainer} ${hideNavigation ? styles.minified : ''}`}>

      <div className={styles.characterColumn}>
        <div className={styles.characterWrapper}>
          <span className={styles.placeholder}>CHAR</span>

        </div>
      </div>

      <div className={styles.contentColumn}>
        <div className={styles.topRow}>
          <div className={styles.logoWrapper}>
            <img src={SpectrumLogo} alt="Spectrum Logo" className={styles.mainLogo} />
          </div>

          <div className={styles.userArea}>
            <span className={styles.userGreeting}>
              {t('greeting', { name: username })}
            </span>
            <ProfileImageNavbar
              imageUrl={undefined}
              onClick={onProfileClick}
            />
          </div>
        </div>

        {!hideNavigation && (
          <nav className={styles.bottomRow}>
            <NavButton
              label={t('nav.home')}
              onClick={() => navigate('/home')}
              isActive={location.pathname === '/home'}
            />
            <NavButton
              label={t('nav.games')}
              onClick={() => navigate('/games')}
              isActive={location.pathname === '/games'}
            />
            <NavButton label={t('nav.trending')} />
            <NavButton label={t('nav.clips')} />
            <NavButton label={t('nav.cripta')}/>
          </nav>
        )}
      </div>
    </header>
  );
};
