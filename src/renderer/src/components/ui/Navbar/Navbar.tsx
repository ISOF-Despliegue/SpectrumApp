import styles from './Navbar.module.css'

export const Navbar = () => {
  const username = "AbrahamC13";

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <h1>SPECTRUM</h1>
      </div>

      <div className={styles.userSection}>
        <span className={styles.username}>{username}</span>
        <div className={styles.profileCircle}>
        </div>
      </div>

      <div className={styles.navegationButtons}>
        <button className={styles.navButton}>Home</button>
        <button className={styles.navButton}>Settings</button>
      </div>
    </nav>
  );

};
