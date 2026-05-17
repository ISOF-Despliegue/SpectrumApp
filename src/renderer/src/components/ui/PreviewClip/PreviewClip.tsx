import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PreviewClip.css';
import { ActionButton } from '../ActionButton';

import manoLike from '../../../assets/images/common/manoLike.png';
import manoLikeActive from '../../../assets/images/common/manoLikeActive.png';
import manoDislike from '../../../assets/images/common/manoDislike.png';
import manoDislikeActive from '../../../assets/images/common/manoDislikeActive.png';

/**
 * Interface defining the properties for the PreviewClip component.
 * @property {string} id - Unique identifier for the clip.
 * @property {string} title - The title of the clip.
 * @property {string} [thumbnailUrl] - Optional URL for the video thumbnail image.
 * @property {string} [duration] - Optional formatted duration string (e.g., "0:30").
 * @property {boolean} isEditable - Flag indicating if the clip is in management/edit mode.
 * @property {number} likesCount - Total number of likes for the clip.
 * @property {number} dislikesCount - Total number of dislikes for the clip.
 * @property {boolean} isOwner - True if the current logged-in user owns this clip.
 * @property {'like' | 'dislike' | null} userVote - The current user's active vote status.
 * @property {function} [onDelete] - Callback function triggered when a clip deletion is confirmed.
 * @property {function} [onLike] - Callback function triggered when the like button is pressed.
 * @property {function} [onDislike] - Callback function triggered when the dislike button is pressed.
 * @property {function} [onPlay] - Callback function triggered when the card is clicked to play the video.
 */
interface PreviewClipProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: string;
  isEditable: boolean;
  likesCount: number;
  dislikesCount: number;
  isOwner: boolean;
  userVote: 'like' | 'dislike' | null;
  onDelete?: (id: string) => void;
  onLike?: () => void;
  onDislike?: () => void;
  onPlay?: (id: string) => void;
}

/**
 * PreviewClip component renders a video card with full user interaction states,
 * including dynamic voting buttons and an inline deletion confirmation layer.
 */
export const PreviewClip: React.FC<PreviewClipProps> = ({
  id,
  title,
  thumbnailUrl,
  duration,
  isEditable,
  likesCount,
  dislikesCount,
  isOwner,
  userVote,
  onDelete,
  onLike,
  onDislike,
  onPlay
}) => {
  const { t } = useTranslation(['profile', 'common']);

  // Local state to manage the inline confirmation overlay visibility
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  /**
   * Activates the inline confirmation view.
   */
  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  /**
   * Dismisses the inline confirmation view.
   */
  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  /**
   * Confirms the deletion and invokes the upper component callback.
   */
  const handleConfirmDelete = () => {
    onDelete?.(id);
    setShowConfirmDelete(false);
  };

  /**
   * Dispatches the like action preventing card click propagation.
   * @param {React.MouseEvent} event - The mouse click event.
   */
  const handleLikeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isOwner && onLike) {
      onLike();
    }
  };

  /**
   * Dispatches the dislike action preventing card click propagation.
   * @param {React.MouseEvent} event - The mouse click event.
   */
  const handleDislikeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isOwner && onDislike) {
      onDislike();
    }
  };

  return (
    <div className="clipContainer" onClick={() => onPlay?.(id)}>
      <img
        src={thumbnailUrl || 'https://via.placeholder.com/240x135'}
        alt={title}
        className="clipThumbnail"
      />

      <div className="infoLayer">
        <div className="textMeta">
          <span className="clipTitle">{title}</span>
          {duration && <span className="clipDuration">{duration}</span>}
        </div>

        {!isEditable && (
          <div className={`votesWrapper ${isOwner ? 'disabledVotes' : ''}`}>
            <div className="voteButton" onClick={handleLikeClick}>
              <img
                src={userVote === 'like' ? manoLikeActive : manoLike}
                alt="Like"
                className="voteIcon"
              />
              <span className="voteCounter">{likesCount}</span>
            </div>

            <div className="voteButton" onClick={handleDislikeClick}>
              <img
                src={userVote === 'dislike' ? manoDislikeActive : manoDislike}
                alt="Dislike"
                className="voteIcon"
              />
              <span className="voteCounter">{dislikesCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Management badge visible only when editing profile */}
      {isEditable && (
        <div className="deleteBadge" onClick={(event) => event.stopPropagation()}>
          <ActionButton
            variant="delete"
            size="small"
            onClick={handleDeleteClick}
          >
            {t('profile:actions.delete')}
          </ActionButton>
        </div>
      )}

      {/* Central play button icon, hidden if confirmation layer is active */}
      {!showConfirmDelete && <div className="playIcon">▶</div>}

      {/* Inline confirmation panel that replaces card view upon delete request */}
      {showConfirmDelete && (
        <div className="confirmOverlay" onClick={(event) => event.stopPropagation()}>
          <p className="confirmText">{t('profile:messages.deleteClipConfirmation')}</p>
          <div className="confirmActions">
            {/* Using standardized variants matching your ActionButton contract */}
            <ActionButton variant="neutral" size="small" onClick={handleConfirmDelete}>
              {t('common:confirmations.yes')}
            </ActionButton>
            <ActionButton variant="cancel" size="small" onClick={handleCancelDelete}>
              {t('common:confirmations.no')}
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};
