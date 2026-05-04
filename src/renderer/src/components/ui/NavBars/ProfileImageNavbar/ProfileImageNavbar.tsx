import React from 'react';
import styles from './ProfileImageNavbar.module.css';
import defaultPhoto from '../../../../assets/images/common/defaultPhotoProfile.png';

interface ProfileImageNavbarProps {
  imageUrl?: string;
  onClick?: () => void;
}

export const ProfileImageNavbar: React.FC<ProfileImageNavbarProps> = ({ imageUrl, onClick }) => {
  const profileImg = imageUrl || defaultPhoto;

  return (
    <div className={styles.profileCircle} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className={styles.imageWrapper}>
        <img
          src={profileImg}
          alt="User Profile"
          className={styles.avatarImage}
        />
      </div>
    </div>
  );
};
