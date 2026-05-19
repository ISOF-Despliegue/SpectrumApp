import React from 'react';
import { useTranslation } from 'react-i18next';
import { PreviewClip } from '../PreviewClip';
import styles from './ClipGrid.module.css'; // Changed to use CSS Modules

/**
 * Interface representing the structure of a clip item within the grid.
 */
interface ClipItemData {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: string;
  likesCount: number;
  dislikesCount: number;
  url: string;
}

/**
 * Interface defining the properties for the ClipGrid component.
 * @property {ClipItemData[]} clipsList - Array of clips data objects fetched from the service.
 * @property {boolean} isLoading - Controls the visual rendering of skeleton loaders.
 * @property {boolean} isEditable - Passes management permissions to individual cards.
 * @property {boolean} isProfileOwner - Flags if the logged user owns the rendered list.
 * @property {Record<string, 'like' | 'dislike' | null>} userVotes - Dictionary mapping clip IDs to the active user's vote.
 * @property {function} onPlayClip - Triggered when a preview card is clicked to open the player.
 * @property {function} onDeleteClip - Propagates the verified clip ID deletion to the service level.
 * @property {function} [onLikeClip] - Callback function to dispatch a positive interaction.
 * @property {function} [onDislikeClip] - Callback function to dispatch a negative interaction.
 */
interface ClipGridProps {
  clipsList: ClipItemData[];
  isLoading: boolean;
  isEditable: boolean;
  isProfileOwner: boolean;
  userVotes: Record<string, 'like' | 'dislike' | null>;
  onPlayClip: (id: string) => void;
  onDeleteClip: (id: string) => void;
  onLikeClip?: (id: string) => void;
  onDislikeClip?: (id: string) => void;
}

/**
 * ClipGrid component aggregates and arranges PreviewClip components in a responsive layout.
 * Supports lazy skeleton state loaders and unified localized empty states using CSS Modules.
 */
export const ClipGrid: React.FC<ClipGridProps> = ({
  clipsList,
  isLoading,
  isEditable,
  isProfileOwner,
  userVotes,
  onPlayClip,
  onDeleteClip,
  onLikeClip,
  onDislikeClip
}) => {
  const { t } = useTranslation(['profile']);

  const skeletonItems = Array.from({ length: 4 }, (_, index) => index);

  if (isLoading) {
    return (
      <div className={styles.gridContainer}>
        {skeletonItems.map((itemKey) => (
          <div key={itemKey} className={styles.skeletonCard}>
            <div className={styles.skeletonThumbnail} />
            <div className={styles.skeletonMeta} />
          </div>
        ))}
      </div>
    );
  }

  if (clipsList.length === 0) {
    return (
      <div className={styles.emptyGridContainer}>
        <p className={styles.emptyGridText}>
          {t('profile:placeholders.emptyClips')}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      {clipsList.map((currentClip) => {
        const activeUserVote = userVotes[currentClip.id] || null;

        return (
          <PreviewClip
            key={currentClip.id}
            id={currentClip.id}
            title={currentClip.title}
            thumbnailUrl={currentClip.thumbnailUrl}
            duration={currentClip.duration}
            url={currentClip.url}
            isEditable={isEditable}
            likesCount={currentClip.likesCount}
            dislikesCount={currentClip.dislikesCount}
            isOwner={isProfileOwner}
            userVote={activeUserVote}
            onPlay={onPlayClip}
            onDelete={onDeleteClip}
            onLike={() => onLikeClip?.(currentClip.id)}
            onDislike={() => onDislikeClip?.(currentClip.id)}
          />
        );
      })}
    </div>
  );
};
