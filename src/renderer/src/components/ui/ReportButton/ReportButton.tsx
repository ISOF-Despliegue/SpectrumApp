import React from 'react';
import styles from './ReportButton.module.css';
import { PiWarningOctagonFill } from "react-icons/pi";
import { useTranslation } from 'react-i18next';

interface ReportButtonProps {
  onClick?: () => void;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ onClick }) => {
  const { t } = useTranslation('report');

  return (
    <button
      className={styles.reportBtn}
      onClick={onClick}
      title={t('reportModal.reportButton')}
      aria-label={t('reportModal.reportButton')}
    >
      <PiWarningOctagonFill className={styles.icon} />
    </button>
  );
};
