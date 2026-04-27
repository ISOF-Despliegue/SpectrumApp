import styles from './ProfileImageMedium.module.css';

interface ProfileImageMediumProps {
  imageUrl?: string;
  onClick: () => void;
}

export const ProfileImageMedium = ({ imageUrl, onClick }: ProfileImageMediumProps) => {
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
