import styles from './ProfileImageNavbar.module.css';

interface ProfileImageNavbarProps {
  imageUrl?: string;
  onClick: () => void;
}

export const ProfileImageNavbar = ({ imageUrl, onClick }: ProfileImageNavbarProps) => {
  const defaultImage = "https://via.placeholder.com/150";

  return (
    <button
      className={styles.profileCircle}
      onClick={onClick}
    >
      <img
        src={imageUrl || defaultImage}
        alt="Profile"
        className={styles.avatarImage}
      />
    </button>
  );
};
