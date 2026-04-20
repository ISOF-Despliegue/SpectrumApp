import styles from './Admin.module.css';

type AdminAction = {
  id: string;
  title: string;
  description: string;
};

const ADMIN_ACTIONS: AdminAction[] = [
  {
    id: 'CU-09',
    title: 'Consultar panel de gráficos',
    description:
      'Visualiza métricas clave del sistema para tomar decisiones rápidas sobre contenido y operación.',
  },
  {
    id: 'CU-10',
    title: 'Eliminar reseñas o comentarios',
    description:
      'Modera reseñas y comentarios reportados para mantener la calidad y seguridad de la plataforma.',
  },
  {
    id: 'CU-12',
    title: 'Administrar cuentas de terceros',
    description:
      'Revisa estado, permisos y trazabilidad de cuentas asociadas a integraciones externas.',
  },
  {
    id: 'CU-11',
    title: 'Configurar perfil de usuario',
    description:
      'Actualiza datos del administrador, preferencias y configuraciones operativas del panel.',
  },
  {
    id: 'CU-13',
    title: 'Gestionar niveles de acceso',
    description:
      'Asigna o revoca permisos por rol para reforzar seguridad y segregación de funciones.',
  },
];

export const Admin = () => {
  return (
    <main className={styles.adminPage}>
      <div className={styles.topBanner}>
        <div className={styles.brandContainer}>
          <div className={styles.logoPlaceholder}>Logo</div>
          <div>
            <p className={styles.badge}>SpectrumApp · Administración</p>
            <h2 className={styles.brandTitle}>Panel de control</h2>
          </div>
        </div>

        <div className={styles.profileSummary}>
          <div className={styles.avatarPlaceholder} />
          <div>
            <p className={styles.badge}>Administrador</p>
          </div>
        </div>
      </div>

      <div className={styles.bodyLayout}>
        <aside className={styles.sidebar} aria-label="Navegación del administrador">
          <button type="button" className={styles.sidebarButton}>
            Dashboard
          </button>
          <button type="button" className={styles.sidebarButton}>
            Reseñas
          </button>
          <button type="button" className={styles.sidebarButton}>
            Usuarios
          </button>
          <button type="button" className={styles.sidebarButton}>
            Permisos
          </button>
          <button type="button" className={styles.sidebarButton}>
            Configuración
          </button>
        </aside>

        <div className={styles.contentArea}>
          <header className={styles.hero}>
            <h1 className={styles.title}>Panel principal de administrador</h1>
            <p className={styles.subtitle}>
              Accesos rápidos a las operaciones críticas para monitoreo, moderación y gestión de
              cuentas.
            </p>
          </header>

          <section className={styles.actionsSection} aria-labelledby="admin-actions-title">
            <h2 id="admin-actions-title" className={styles.sectionTitle}>
              Acciones disponibles
            </h2>

            <div className={styles.actionsGrid}>
              {ADMIN_ACTIONS.map((action) => (
                <article key={action.id} className={styles.actionCard}>
                  <p className={styles.actionId}>{action.id}</p>
                  <h3 className={styles.actionTitle}>{action.title}</h3>
                  <p className={styles.actionDescription}>{action.description}</p>
                  <button type="button" className={styles.actionButton}>
                    Ir a módulo
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
