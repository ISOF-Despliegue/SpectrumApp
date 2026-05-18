import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';
import { ProfileSection } from './ProfileSection';
import styles from '../../../pages/Profile/Profile.module.css';

/**
 * Interface representing core gaming clip preview data constraints.
 */
interface ClipData {
  id: string;
  title: string;
  thumbnailUrl?: string;
  gameName?: string;
}

/**
 * Interface defining properties for the ProfileClipsSection component.
 */
interface ProfileClipsSectionProps {
  profileUserId: string;
  isEditing: boolean;
  isOwner: boolean;
  onOpenUploadWizard: () => void;
}

/**
 * ProfileClipsSection renders a static, non-scrolling preview of video clips inside the profile sidebar.
 * Symmetrically delegates modal trigger operations directly to the page root container.
 */
export const ProfileClipsSection: React.FC<ProfileClipsSectionProps> = ({
  profileUserId,
  isEditing,
  isOwner,
  onOpenUploadWizard
}) => {
  const { t } = useTranslation(['profile']);
  const [clipsList, setClipsList] = useState<ClipData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (profileUserId) {
      fetchClipsData();
    }
  }, [profileUserId]);

  /**
   * Fetches the user video clips collection from the backend api services.
   */
  const fetchClipsData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ClipData[]>(`/clips/user/${profileUserId}`);
      setClipsList(response.data);
    } catch (error) {
      console.error('Error fetching clips summary:', error);
      setClipsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const previewClips = clipsList.slice(0, 4);

  // When collection is completely empty and editing mode is disabled, render standard placeholder paragraph
  if (!isLoading && clipsList.length === 0 && !isEditing) {
    return (
      <ProfileSection title={t('profile:sections.clips')} showSeeMore={false}>
        <p className={styles.emptyPlaceholder}>
          {t('profile:placeholders.emptyClips')}
        </p>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection
      title={t('profile:sections.clips')}
      showSeeMore={clipsList.length > 4 && !isEditing}
    >
      <div className={styles.gamesGrid}>
        {previewClips.map((clip) => (
          <div
            key={clip.id}
            className={styles.logoWrapper}
            style={{ cursor: 'pointer', background: '#2d2d35', borderRadius: '8px', overflow: 'hidden' }}
            title={clip.title}
          >
            {clip.thumbnailUrl ? (
              <img
                src={clip.thumbnailUrl}
                alt={clip.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ fontSize: '0.75rem', padding: '8px', textAlign: 'center', color: '#aaa' }}>
                {clip.title}
              </div>
            )}
          </div>
        ))}

        {isEditing && isOwner && (
          <button
            className={styles.addGameBtn}
            onClick={onOpenUploadWizard}
            title={t('profile:clips.uploadBtn')}
          >
            +
          </button>
        )}
      </div>
    </ProfileSection>
  );
};
