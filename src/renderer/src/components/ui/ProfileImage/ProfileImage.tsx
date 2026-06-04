import type React from 'react';
import styles from './ProfileImage.module.css';

interface ProfileImageProps {
  imageUrl?: string;
  alt?: string;
  onClick?: () => void;
}

export const ProfileImage = ({ imageUrl, alt = 'Profile', onClick }: ProfileImageProps): React.JSX.Element => {
  const defaultImage = "https://via.placeholder.com/150";

  return (
    <button
      className={styles.profileCircle}
      onClick={onClick}
    >
      <img
        src={imageUrl || defaultImage}
        alt={alt}
        className={styles.avatarImage}
        loading="lazy"
      />
    </button>
  );
};
