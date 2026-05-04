import React from 'react';
import styles from './ReportButton.module.css';
import { PiWarningOctagonFill } from "react-icons/pi";

interface ReportButtonProps {
  onClick?: () => void;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ onClick }) => {
  return (
    <button
      className={styles.reportBtn}
      onClick={onClick}
      title="Reportar reseña"
    >
      <PiWarningOctagonFill className={styles.icon} />
    </button>
  );
};
