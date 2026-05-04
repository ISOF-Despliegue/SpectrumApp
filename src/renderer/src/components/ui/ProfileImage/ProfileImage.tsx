import styles from './ProfileImage.module.css';

interface ProfileImageProps {
  imageUrl?: string;
  onClick?: () => void;
}

export const ProfileImage = ({ imageUrl, onClick }: ProfileImageProps) => {
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
