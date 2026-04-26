import styles from './ProfileImageBig.module.css';

interface ProfileImageBigProps {
  imageUrl?: string;
  onClick: () => void;
}

export const ProfileImageBig = ({ imageUrl, onClick }: ProfileImageBigProps) => {
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
