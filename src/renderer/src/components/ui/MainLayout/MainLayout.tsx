import { Navbar } from '../NavBars/Navbar';
import styles from './MainLayout.module.css';

interface Props {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: Props) => {
  return (
    <div className={styles.layoutContainer}>
      <Navbar onProfileClick={() => {}} />

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};
