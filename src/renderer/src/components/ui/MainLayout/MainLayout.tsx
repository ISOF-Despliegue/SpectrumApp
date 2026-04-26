import { Navbar } from '../NavBars/Navbar';
import styles from './MainLayout.module.css';

interface Props {
  children: React.ReactNode;
  isScrollable?: boolean;
}

export const MainLayout = ({ children, isScrollable = true }: Props) => {
  return (
    <div className={styles.layoutContainer}>
      <Navbar onProfileClick={() => {}} />

      <main className={`${styles.mainContent} ${isScrollable ? styles.scrollable : ''}`}>
        {children}
      </main>
    </div>
  );
};
