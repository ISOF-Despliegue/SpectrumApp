import type React from 'react';
import { FaRegCommentDots, FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import type { Review, ReviewComment } from '../../../types/reviews.types';
import { ReviewComments } from './ReviewComments';
import styles from './GameReviews.module.css';

interface ReviewCardProps {
  review: Review;
  comments: ReviewComment[];
  commentsVisible: boolean;
  isBusy: boolean;
  isAuthenticated: boolean;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
  onVote: (reviewId: string, isPositive: boolean) => void;
  onToggleComments: (reviewId: string) => void;
  onCommentsChanged: (reviewId: string, comments: ReviewComment[]) => void;
  onMessage: (message: string) => void;
}

const isVideoAttachment = (review: Review): boolean => {
  return review.attachmentType === 'video';
};

const getAttachmentUrl = (review: Review): string => review.attachmentUrl || review.imageUrl || '';

const getReviewAuthorName = (review: Review): string => review.username || 'Usuario Spectrum';

const getReviewAvatarUrl = (review: Review): string => {
  return review.userProfileImageUrl || review.profilePicture || '';
};

const getReviewAuthorInitial = (review: Review): string => {
  return getReviewAuthorName(review).trim().charAt(0).toUpperCase() || 'S';
};

export const ReviewCard = ({
  review,
  comments,
  commentsVisible,
  isBusy,
  isAuthenticated,
  onEdit,
  onDelete,
  onVote,
  onToggleComments,
  onCommentsChanged,
  onMessage
}: ReviewCardProps): React.JSX.Element => {
  const attachmentUrl = getAttachmentUrl(review);
  const avatarUrl = getReviewAvatarUrl(review);
  const canEdit = review.isOwnReview;
  const canDelete = review.canDelete;

  return (
    <article className={styles.reviewCard}>
      <header className={styles.reviewHeader}>
        <div className={styles.reviewAuthorBlock}>
          {avatarUrl ? (
            <img
              className={styles.reviewAvatar}
              src={avatarUrl}
              alt={`Avatar de ${getReviewAuthorName(review)}`}
            />
          ) : (
            <span className={styles.reviewAvatarFallback}>{getReviewAuthorInitial(review)}</span>
          )}
          <div>
            <h2>{review.title}</h2>
            <p>
              {getReviewAuthorName(review)} - {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <strong className={styles.scoreBadge}>{review.rating}/10</strong>
      </header>

      <p className={styles.reviewContent}>{review.content}</p>

      {attachmentUrl && (
        <div className={styles.attachment}>
          {isVideoAttachment(review) ? (
            <video src={attachmentUrl} controls preload="metadata" />
          ) : (
            <img src={attachmentUrl} alt={`Adjunto de ${review.title}`} />
          )}
        </div>
      )}

      <div className={styles.reviewActions}>
        <button
          className={styles.actionButton}
          type="button"
          disabled={isBusy || review.isOwnReview}
          onClick={() => onVote(review.id, true)}
          title={review.isOwnReview ? 'No puedes votar tu propia resena' : 'Like'}
        >
          <FaThumbsUp /> {review.likesCount ?? 0}
        </button>
        <button
          className={styles.actionButton}
          type="button"
          disabled={isBusy || review.isOwnReview}
          onClick={() => onVote(review.id, false)}
          title={review.isOwnReview ? 'No puedes votar tu propia resena' : 'Dislike'}
        >
          <FaThumbsDown /> {review.dislikesCount ?? 0}
        </button>
        <button
          className={styles.actionButton}
          type="button"
          disabled={isBusy}
          onClick={() => onToggleComments(review.id)}
        >
          <FaRegCommentDots /> Ver respuestas
        </button>
        {isAuthenticated && (
          <button
            className={styles.actionButton}
            type="button"
            disabled={isBusy}
            onClick={() => onToggleComments(review.id)}
          >
            Responder
          </button>
        )}
        {canEdit && (
          <button className={styles.textButton} type="button" onClick={() => onEdit(review)}>
            Editar
          </button>
        )}
        {canDelete && (
          <button className={styles.textButtonDanger} type="button" onClick={() => onDelete(review.id)}>
            Eliminar
          </button>
        )}
      </div>

      {commentsVisible && (
        <ReviewComments
          reviewId={review.id}
          comments={comments}
          isAuthenticated={isAuthenticated}
          onMessage={onMessage}
          onCommentsChanged={(nextComments) => onCommentsChanged(review.id, nextComments)}
        />
      )}
    </article>
  );
};
