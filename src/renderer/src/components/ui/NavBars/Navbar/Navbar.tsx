import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavButton } from '../NavButton';
import { ProfileImageNavbar } from '../ProfileImageNavbar';
import SpectrumLogo from '../../../../assets/images/common/SpectrumLogo.png';
import HappyGhostIncomplete from '../../../../assets/images/character/happyGhostIncomplete.png';
import styles from './Navbar.module.css';
import { ProfileService, UserProfile } from '../../../../services/profile.service';
import defaultPhoto from '../../../../assets/images/common/defaultPhotoProfile.png';
import { AuthService, ROLES } from '../../../../services/auth.service';


interface NavbarProps {
  hideNavigation?: boolean;
  onProfileClick?: () => void;
}

export const Navbar = ({ hideNavigation = false, onProfileClick }: NavbarProps): React.JSX.Element => {
  const { t } = useTranslation('navbar');
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfileData = async (): Promise<void> => {
      try {
        const data = await ProfileService.getMe();
        setProfile(data);
      } catch (error) {
        console.error("Error obtaining profile data:", error);
      }
    };
    if (localStorage.getItem('token')) {
      fetchProfileData();
    }
  }, []);

  const handleInternalProfileClick = (): void => {
    if (onProfileClick) {
      onProfileClick();
      return;
    }
    const currentUser = AuthService.getCurrentUser();
    if (currentUser?.role === ROLES.ADMIN) {
      navigate('/admin/my-profile');
      return;
    }
    navigate('/profile');
  };

  const handleLogout = (): void => {
    AuthService.logout();
    setProfile(null);
    navigate('/login', { replace: true });
  };

  const username = profile?.username || "Cargando...";
  const userProfileImage = profile?.profilePicture || defaultPhoto;

  return (
    <header className={`${styles.navbarContainer} ${hideNavigation ? styles.minified : ''}`}>

      <div className={styles.characterColumn}>
        <div className={styles.characterWrapper}>
          <img src={HappyGhostIncomplete} alt="Character Image" className={styles.characterImage} />
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
              imageUrl={userProfileImage}
              onClick={handleInternalProfileClick}
            />
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              {t('nav.logout')}
            </button>
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
            <NavButton
              label={t('nav.trending')}
              onClick={() => navigate('/trends')}
              isActive={location.pathname === '/trends'}
            />
            <NavButton
              label={t('nav.clips')}
              onClick={() => navigate('/weekly-clips')}
              isActive={location.pathname === '/weekly-clips'}
            />
            <NavButton
              label={t('nav.cripta')}
              onClick={() => navigate('/crypt')}
              isActive={location.pathname === '/crypt'}
            />
          </nav>
        )}
      </div>
    </header>
  );
};
