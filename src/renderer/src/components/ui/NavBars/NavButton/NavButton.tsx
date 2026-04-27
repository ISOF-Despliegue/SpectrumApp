import React from 'react';
import styles from './NavButton.module.css';

interface NavButtonProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const NavButton: React.FC<NavButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      className={`${styles.navButton} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.purpleFilm} />

      <span className={styles.label}>{label}</span>

      <div className={styles.neonLine} />
    </button>
  );
};
