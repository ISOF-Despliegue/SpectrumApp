import { useTranslation } from 'react-i18next';
import { NavAdminButton } from '../NavAdminButton';
import styles from './NavbarAdmin.module.css';

export const NavbarAdmin = () => {
  const { t } = useTranslation('navbar');

  return (
    <header className={styles.navbarContainer}>

      <div className={styles.contentColumn}>

        <nav className={styles.bottomRow}>
          <NavAdminButton label={t('navbar.myProfile')} />
          <NavAdminButton label={t('navbar.globalMetrics')} />
          <NavAdminButton label={t('navbar.adminUsers')} />
          <NavAdminButton label={t('navbar.adminReviews')} />
          <NavAdminButton label={t('navbar.adminEvents')} />
          <NavAdminButton label={t('navbar.adminReports')} />
          <NavAdminButton label={t('navbar.adminsManagement')} />
        </nav>

      </div>
    </header>
  );
};
