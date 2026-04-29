import { Navbar } from '../NavBars/Navbar';
import { Footer } from '../Footer/Footer';
import styles from './MainLayout.module.css';

interface Props {
  children: React.ReactNode;
  isScrollable?: boolean;
  hideNavigation?: boolean;
  showNavbar?: boolean;
}

export const MainLayout = ({ children, isScrollable = true, hideNavigation = false, showNavbar = true }: Props) => {
  return (
    <div className={styles.layoutContainer}>
      {showNavbar && (
        <Navbar
          onProfileClick={() => {}}
          hideNavigation={hideNavigation}
        />
      )}

      <main className={`${styles.mainContent} ${isScrollable ? styles.scrollable : ''}`}>
        {children}
      </main>

      {showNavbar && <Footer />}
    </div>
  );
};
