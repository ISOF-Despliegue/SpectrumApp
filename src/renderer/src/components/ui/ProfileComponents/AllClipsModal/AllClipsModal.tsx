import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipGrid } from '../../ClipGrid/ClipGrid';
import { SortFilter, SortOption } from '../../SortFilter/SortFilter';
import styles from './AllClipsModal.module.css';

/**
 * Interface representing the model structure of a video clip asset item.
 * Supports both camelCase and PascalCase variations due to backend DTO serialization conventions.
 */
interface ClipData {
  id: string;
  title: string;
  thumbnailUrl?: string;
  gameName?: string;
  url: string;
  likesCount: number;
  dislikesCount: number;
  userVote?: 'like' | 'dislike' | null;
  createdAt?: string;
  CreatedAt?: string;
}

/**
 * Interface defining the properties for the AllClipsModal component.
 * @property {boolean} isOpen - Controls the overlay wrapper rendering and visibility state.
 * @property {function} onClose - Callback handler to change state and collapse the modal window.
 * @property {ClipData[]} clipsList - Complete unfiltered array of user video clips fetched from the service layer.
 * @property {boolean} isEditable - Passes administrative configuration permissions to the sub-grid cards.
 * @property {boolean} isProfileOwner - Flag that tracks if the logged-in user owns the displayed collection.
 * @property {function} onPlayClip - Callback invoked when a preview card is clicked to initiate video streaming.
 * @property {function} onDeleteClip - Propagates verified item removal actions down to the API layer.
 */
interface AllClipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clipsList: ClipData[];
  isEditable: boolean;
  isProfileOwner: boolean;
  onPlayClip: (id: string) => void;
  onDeleteClip: (id: string) => void;
  onLikeClip?: (id: string) => void;
  onDislikeClip?: (id: string) => void;
}

/**
 * AllClipsModal overlays an immersive glassmorphic container displaying a user's full collection of video assets.
 * Reuses the modular ClipGrid layout engine and implements a reactive useMemo multi-criteria sorting strategy.
 */
export const AllClipsModal: React.FC<AllClipsModalProps> = ({
  isOpen,
  onClose,
  clipsList,
  isEditable,
  isProfileOwner,
  onPlayClip,
  onDeleteClip,
  onLikeClip,
  onDislikeClip
}) => {
  const { t } = useTranslation(['profile']);
  const [sortBy, setSortBy] = useState<string>('recent');

  const sortOptions: SortOption[] = [
    { value: 'recent', label: t('profile:orderOptions.recent') },
    { value: 'oldest', label: t('profile:orderOptions.oldest') },
    { value: 'alphabetical', label: t('profile:orderOptions.alphabetical') }
  ];

  /**
   * Memoized processing pipeline that filters and sorts the clips collection reactively.
   * Isolates sorting routines from parent re-renders unless changes occur in clipsList or sortBy.
   */
  const sortedClips = useMemo(() => {
    const clipsCopy = [...clipsList];

    const getClipTitle = (clip: ClipData): string => {
      return clip.title || (clip as any).Title || '';
    };

    const getClipTime = (clip: ClipData): number => {
      const rawDate = clip.createdAt || clip.CreatedAt;
      if (!rawDate) return 0;

      const parsedTime = new Date(rawDate).getTime();
      return isNaN(parsedTime) ? 0 : parsedTime;
    };

    if (sortBy === 'alphabetical') {
      return clipsCopy.sort((a, b) => getClipTitle(a).localeCompare(getClipTitle(b)));
    }

    if (sortBy === 'oldest') {
      return clipsCopy.sort((a, b) => getClipTime(a) - getClipTime(b));
    }

    return clipsCopy.sort((a, b) => getClipTime(b) - getClipTime(a));
  }, [clipsList, sortBy]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t('profile:sections.clips')}</h3>

          <div className={styles.headerControls}>
            <SortFilter
              label={t('profile:labels.orderBy')}
              currentValue={sortBy}
              options={sortOptions}
              onSortChange={(value) => setSortBy(value)}
            />
            <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
              &times;
            </button>
          </div>
        </header>

        <div className={styles.gridWrapper}>
          <ClipGrid
            clipsList={sortedClips}
            isLoading={false}
            isEditable={isEditable}
            isProfileOwner={isProfileOwner}
            userVotes={Object.fromEntries(sortedClips.map((clip) => [clip.id, clip.userVote ?? null]))}
            onPlayClip={onPlayClip}
            onDeleteClip={onDeleteClip}
            onLikeClip={onLikeClip}
            onDislikeClip={onDislikeClip}
          />
        </div>
      </div>
    </div>
  );
};
