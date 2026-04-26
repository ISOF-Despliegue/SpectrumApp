import React from 'react';
import styles from './GlassContainer.module.css';

interface GlassContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ children, className }) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.filmOverlay} />

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
