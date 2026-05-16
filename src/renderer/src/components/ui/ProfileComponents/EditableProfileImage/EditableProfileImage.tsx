import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateImageFile } from '../../../../utilities/imageValidation';
import { ProfileService } from '../../../../services/profile.service';
import defaultPhoto from '../../../../assets/images/common/defaultPhotoProfile.png';
import styles from './EditableProfileImage.module.css';

/**
 * Properties required for the EditableProfileImage component.
 */
interface EditableProfileImageProps {
  imageUrl?: string | null;
  isEditing: boolean;
  onAvatarUpdated: (newUrl: string) => void;
}

/**
 * A circular profile image component that supports an interactive edit mode
 * with a visual overlay, hover effects, inline loading spinner, and pro-active error handling.
 */
export const EditableProfileImage: React.FC<EditableProfileImageProps> = ({
  imageUrl,
  isEditing,
  onAvatarUpdated
}) => {
  const { t } = useTranslation('imageUpload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  /**
   * Triggers the hidden file explorer window when clicking the container in edit mode.
   */
  const handleContainerClick = (): void => {
    if (isEditing && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Processes the selected file, executes local validations, and triggers the network upload.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setValidationError('');

      validateImageFile(file);

      setIsUploading(true);
      const uploadedUrl = await ProfileService.updateAvatar(file);

      onAvatarUpdated(uploadedUrl);
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || t('messages.error');
      setValidationError(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const containerClass = `${styles.profileImageContainer} ${
    isEditing ? styles.isEditable : styles.isStatic
  } ${isUploading ? styles.isUploading : ''}`;

  return (
    <div className={styles.avatarComponentWrapper}>
      <div
        className={containerClass}
        onClick={handleContainerClick}
        role={isEditing ? 'button' : 'presentation'}
        tabIndex={isEditing ? 0 : -1}
      >
        <img
          src={imageUrl || defaultPhoto}
          alt="Profile"
          className={styles.profileImage}
        />

        {isEditing && !isUploading && (
          <div className={styles.editOverlay}>
            <div className={styles.pencilIcon}>✎</div>
            <span className={styles.changeText}>{t('actions.change')}</span>
          </div>
        )}

        {isUploading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept=".png,.jpeg,.jpg"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {isEditing && (
        <span className={styles.requirementsText}>
          {t('requirements.formats')} • {t('requirements.size')}
        </span>
      )}

      {validationError && isEditing && (
        <span className={styles.inlineErrorText}>
          {validationError}
        </span>
      )}
    </div>
  );
};
