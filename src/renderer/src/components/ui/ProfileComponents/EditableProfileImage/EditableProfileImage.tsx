import React from 'react';
import styles from './EditableProfileImage.module.css'; // Importamos como 'styles'
import defaultPhoto from '../../../../assets/images/common/defaultPhotoProfile.png';

interface EditableProfileImageProps {
  imageUrl?: string | null;
  isEditing: boolean;
  onEditClick?: () => void;
}

/// <summary>
/// A circular profile image component that supports an interactive edit mode
/// with a visual overlay and hover effects.
/// </summary>
export const EditableProfileImage: React.FC<EditableProfileImageProps> = ({
  imageUrl,
  isEditing,
  onEditClick
}) => {

  // Combinamos las clases usando el objeto styles
  const containerClass = `${styles.profileImageContainer} ${
    isEditing ? styles.isEditable : styles.isStatic
  }`;

  return (
    <div
      className={containerClass}
      onClick={isEditing ? onEditClick : undefined}
      role={isEditing ? 'button' : 'presentation'}
      tabIndex={isEditing ? 0 : -1}
    >
      <img
        src={imageUrl || defaultPhoto} // Usamos tu foto default del proyecto
        alt="Profile"
        className={styles.profileImage}
      />

      {isEditing && (
        <div className={styles.editOverlay}>
          <div className={styles.pencilIcon}>✎</div>
          <span className={styles.changeText}>Cambiar</span>
        </div>
      )}
    </div>
  );
};
