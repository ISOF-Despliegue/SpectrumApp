import styles from './Sidebar.module.css';

export const Sidebar = () => {
  const menuOptions = [
    "Inicio",
    "Videojuegos",
    "Tendencia",
    "Clips semanales",
    "Cripta"
  ];

  return (
    <aside className={styles.sidebar}>
      <ul className={styles.menuList}>
        {menuOptions.map((option) => (
          <li key={option} className={styles.menuItem}>
            {option}
          </li>
        ))}
      </ul>
    </aside>
  );
};
