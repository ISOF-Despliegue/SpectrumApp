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


interface NavbarProps {
  hideNavigation?: boolean;
  onProfileClick: () => void;
}

export const Navbar = ({ hideNavigation = false, onProfileClick }: NavbarProps) => {
  const { t } = useTranslation('navbar');
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
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

  const handleInternalProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    navigate('/profile');
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
