import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';
import { ClipGrid } from '../../ClipGrid';
import { ActionButton } from '../../ActionButton';
import { ClipPlayerModal } from '../../ClipPlayerModal';
import { ClipUploadFlowModal } from '../../VideoComponents/VideoUploadModal/ClipUploadFlowModal';
import styles from './ManageClipsModal.module.css';

/**
 * Interface representing core gaming clip entity constraints.
 */
interface ClipData {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: string;
  likesCount: number;
  dislikesCount: number;
}

/**
 * Interface defining properties for the ManageClipsModal component.
 */
interface ManageClipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUserId: string;
  isOwner: boolean;
}

/**
 * ManageClipsModal renders an isolated superimposed workspace dedicated
 * to user clips history tracking, video removals, and new wizard uploads.
 */
export const ManageClipsModal: React.FC<ManageClipsModalProps> = ({
  isOpen,
  onClose,
  profileUserId,
  isOwner
}) => {
  const { t } = useTranslation(['profile', 'videoUpload']);

  const [clipsList, setClipsList] = useState<ClipData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [activePlayClip, setActivePlayClip] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchClipsData();
    }
  }, [isOpen, profileUserId]);

  /**
   * Fetches the user video clips collection matching the verified database ID hook.
   */
  const fetchClipsData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ClipData[]>(`/clips/user/${profileUserId}`);
      setClipsList(response.data);
    } catch (error) {
      console.error('Error fetching clips inside manager dashboard:', error);
      setClipsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Propagates a secure clip entity deletion workflow to the backend infrastructure.
   * @param clipId The unique identifier of the clip to remove.
   */
  const handleDeleteClip = async (clipId: string) => {
    try {
      await api.delete(`/clips/${clipId}`);
      setClipsList((prev) => prev.filter((item) => item.id !== clipId));
    } catch (error) {
      console.error('Error executing clip deletion request:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <button className={styles.modalCloseX} onClick={onClose}>×</button>

        {/* Internationalized semantic headers */}
        <h2 className={styles.modalTitle}>{t('profile:clips.manageTitle')}</h2>
        <span className={styles.stepIndicator}>{t('profile:clips.manageSubtitle')}</span>

        {isOwner && (
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
            <ActionButton variant="neutral" size="small" onClick={() => setIsUploadOpen(true)}>
              {t('profile:clips.uploadBtn')}
            </ActionButton>
          </div>
        )}

        {/* Full multi-column clip management viewport layout */}
        <div style={{ minHeight: '200px' }}>
          <ClipGrid
            clipsList={clipsList}
            isLoading={isLoading}
            isEditable={true}
            isProfileOwner={isOwner}
            userVotes={{}}
            onPlayClip={(id) => setActivePlayClip(clipsList.find((c) => c.id === id))}
            onDeleteClip={handleDeleteClip}
          />
        </div>

        <div className={styles.actionRowButton}>
          <ActionButton variant="cancel" size="large" onClick={onClose}>
            {t('profile:actions.close')}
          </ActionButton>
        </div>
      </div>

      {/* Floating video immersive player modal workspace layer */}
      {activePlayClip && (
        <ClipPlayerModal
          isOpen={Boolean(activePlayClip)}
          videoUrl={activePlayClip.videoUrl || activePlayClip.thumbnailUrl}
          title={activePlayClip.title}
          gameName={activePlayClip.gameName}
          onClose={() => setActivePlayClip(null)}
        />
      )}

      {/* Upload assistant overlay setup flow routing triggers */}
      {isUploadOpen && (
        <ClipUploadFlowModal
          onClose={() => setIsUploadOpen(false)}
          onRefreshClips={() => {
            setIsUploadOpen(false);
            fetchClipsData();
          }}
        />
      )}
    </div>
  );
};
