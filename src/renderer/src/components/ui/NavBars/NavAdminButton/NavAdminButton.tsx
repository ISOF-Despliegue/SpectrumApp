import styles from './NavAdminButton.module.css';

interface NavAdminButtonProps {
  label: string;
  onClick?: () => void;
}

export const NavAdminButton = ({ label, onClick }: NavAdminButtonProps) => {
  return (

    <button
      className={`${styles.navAdminBtn}`}
      onClick={onClick}
    >
      {label}

    </button>
  );
};
