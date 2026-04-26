import styles from './NavButton.module.css';

interface NavButtonProps {
  label: string;
  isCripta?: boolean;
  onClick?: () => void;
}

export const NavButton = ({ label, isCripta, onClick }: NavButtonProps) => {
  return (
    <button
      className={`${styles.navBtn} ${isCripta ? styles.cripta : ''}`}
      onClick={onClick}
    >
      {label}
      {isCripta && <span className={styles.web}>🕸️</span>}
    </button>
  );
};
