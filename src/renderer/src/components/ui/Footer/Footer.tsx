import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const { t } = useTranslation('footer');

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.content}>
        <p className={styles.copyright}>
          {t('footer.rights')}
        </p>

        <p className={styles.devTag}>
          {t('footer.dev')}
        </p>
      </div>

      <div className={styles.neonSeparator} />
    </footer>
  );
};
