import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';
import { useTranslation } from 'react-i18next';

type AdminNavigationItem = {
  labelKey: string;
  to: string;
};

const ADMIN_NAVIGATION: AdminNavigationItem[] = [
  { labelKey: 'navigation.myProfile', to: 'my-profile' },
  { labelKey: 'navigation.globalMetrics', to: 'global-metrics' },
  { labelKey: 'navigation.manageUsers', to: 'manage-users' },
  { labelKey: 'navigation.manageReviews', to: 'manage-reviews' },
  { labelKey: 'navigation.manageEvents', to: 'manage-events' },
  { labelKey: 'navigation.manageAdmins', to: 'manage-admins' },
];

export const Admin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('admin');

  return (
    <main className={styles.adminPage}>
      <button
        type="button"
        onClick={() => navigate('/login')}
        className={styles.logoutButton}
      >
        {t('navigation.logout')}
      </button>

      <section className={styles.bodyLayout}>
        <aside className={styles.sidebar} aria-label="Panel lateral de administración">
          <nav aria-label="Navegación del administrador" className={styles.sidebarNav}>
            <ul className={styles.sidebarList}>
              {ADMIN_NAVIGATION.map((item) => (
                <li key={item.to} className={styles.sidebarItem}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.sidebarButton} ${styles.sidebarButtonActive}`
                        : styles.sidebarButton
                    }
                  >
                    {t(item.labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className={styles.contentArea}>
          <div className={styles.contentPanel}>
            <Outlet />
          </div>
        </section>
      </section>
    </main>
  );
};
