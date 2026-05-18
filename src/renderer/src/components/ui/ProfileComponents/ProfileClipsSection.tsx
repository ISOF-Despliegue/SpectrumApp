import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';
import { deleteClip } from '../../../services/clips.service';
import { ProfileSection } from './ProfileSection';
import { PreviewClip } from '../PreviewClip/PreviewClip';
import { ClipPlayerModal } from '../ClipPlayerModal/ClipPlayerModal';
import styles from '../../../pages/Profile/Profile.module.css';

/**
 * Interface representing core gaming clip preview data constraints mapped from the backend DTO.
 */
interface ClipData {
  id: string;
  title: string;
  thumbnailUrl?: string;
  gameName?: string;
  url: string;
  likesCount: number;
  dislikesCount: number;
}

interface ProfileClipsSectionProps {
  profileUserId: string;
  isEditing: boolean;
  isOwner: boolean;
  onOpenUploadWizard: () => void;
}

/**
 * ProfileClipsSection renders a static preview of video clips using standardized UI components.
 * Integrates an immersive HTML5 playback container overlay and propagates deletion routines.
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

  const [selectedClip, setSelectedClip] = useState<ClipData | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);

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
      const validClips = response.data.map(clip => ({
        ...clip,
        likesCount: clip.likesCount || 0,
        dislikesCount: clip.dislikesCount || 0
      }));
      setClipsList(validClips);
    } catch (error) {
      console.error('Error fetching clips summary:', error);
      setClipsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Triggers the player modal overlay loading the selected video streaming resource.
   */
  const handlePlayClip = (clipId: string) => {
    const clip = clipsList.find((c) => c.id === clipId);
    if (clip) {
      setSelectedClip(clip);
      setIsPlayerOpen(true);
    }
  };

  /**
   * Dispatches the deletion request to the api layer and updates local state.
   */
  const handleDeleteClip = async (clipId: string) => {
    try {
      await deleteClip(clipId);
      setClipsList((prev) => prev.filter((c) => c.id !== clipId));
    } catch (error) {
      console.error('Failed to delete clip:', error);
    }
  };

  const previewClips = clipsList.slice(0, 4);

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
    <>
      <ProfileSection
        title={t('profile:sections.clips')}
        showSeeMore={clipsList.length > 4 && !isEditing}
      >
        <div className={styles.gamesGrid}>
          {previewClips.map((clip) => (
            <PreviewClip
              key={clip.id}
              id={clip.id}
              title={clip.title}
              thumbnailUrl={clip.thumbnailUrl}
              url={clip.url}
              isEditable={isEditing}
              likesCount={clip.likesCount}
              dislikesCount={clip.dislikesCount}
              isOwner={isOwner}
              userVote={null}
              onPlay={handlePlayClip}
              onDelete={handleDeleteClip}
            />
          ))}

          {isEditing && isOwner && (
            <button
              className={styles.addGameBtn}
              onClick={onOpenUploadWizard}
              title={t('profile:clips.uploadBtn')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                minHeight: '135px'
              }}
            >
              +
            </button>
          )}
        </div>
      </ProfileSection>

      <ClipPlayerModal
        isOpen={isPlayerOpen}
        videoUrl={selectedClip?.url}
        title={selectedClip?.title || ''}
        gameName={selectedClip?.gameName}
        onClose={() => {
          setIsPlayerOpen(false);
          setSelectedClip(null);
        }}
      />
    </>
  );
};
