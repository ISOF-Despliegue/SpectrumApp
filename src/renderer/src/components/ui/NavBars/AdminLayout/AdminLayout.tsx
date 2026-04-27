import React from 'react';
import { Navbar } from '../Navbar';
import { NavbarAdmin } from '../NavbarAdmin';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <NavbarAdmin />
      </aside>

      <div className={styles.mainContent}>
        <Navbar hideNavigation={true} onProfileClick={() => {}} />

        <section className={styles.pageContent}>
          {children}
        </section>
      </div>
    </div>
  );
};
