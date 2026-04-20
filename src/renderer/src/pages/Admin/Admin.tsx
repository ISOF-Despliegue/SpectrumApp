import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';

type AdminNavigationItem = {
  label: string;
  to: string;
};

const ADMIN_NAVIGATION: AdminNavigationItem[] = [
  { label: 'Mi perfil', to: 'my-profile' },
  { label: 'Métricas globales', to: 'global-metrics' },
  { label: 'Administrar usuarios', to: 'manage-users' },
  { label: 'Administrar reseñas', to: 'manage-reviews' },
  { label: 'Administrar eventos', to: 'manage-events' },
  { label: 'Gestión administradores', to: 'manage-admins' },
];

export const Admin = () => {
  const navigate = useNavigate();

  return (
    <main className={styles.adminPage}>
      <button
        type="button"
        onClick={() => navigate('/login')}
        className={styles.logoutButton}
      >
        Cerrar Sesión (Demo)
      </button>

      <header className={styles.topBanner}>
        <div className={styles.brandContainer}>
          <div className={styles.logoPlaceholder} aria-hidden="true">
            No Image
          </div>

          <div className={styles.brandText}>
            <h1 className={styles.brandTitle}>SPECTRUM</h1>
          </div>
        </div>

        <div className={styles.profileSummary}>
          <p className={styles.profileName}>Abraham Cano Ramírez</p>
          <div className={styles.avatarPlaceholder} aria-hidden="true" />
        </div>
      </header>

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
                    {item.label}
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
