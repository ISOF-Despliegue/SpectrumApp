import { useEffect, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import type { Review, ReviewComment } from '../../../types/reviews.types';
import { AuthService, ROLES } from '../../../services/auth.service';
import { ReviewService } from '../../../services/reviews.service';
import { ReviewCardComplete } from '../ReviewCards/ReviewCardComplete';
import styles from './ReviewDetailModal.module.css';

interface ReviewDetailModalProps {
  review: Review | null;
  comments?: ReviewComment[];
  commentsVisible?: boolean;
  isBusy?: boolean;
  isAuthenticated?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => Promise<void> | void;
  onToggleComments?: (reviewId: string) => void;
  onCommentsChanged?: (reviewId: string, comments: ReviewComment[]) => void;
  onClose: () => void;
}

export const ReviewDetailModal = ({
  review,
  comments = [],
  commentsVisible = false,
  isBusy = false,
  isAuthenticated = false,
  onEdit,
  onDelete,
  onToggleComments,
  onCommentsChanged,
  onClose
}: ReviewDetailModalProps): React.JSX.Element | null => {
  const [internalComments, setInternalComments] = useState<ReviewComment[]>([]);
  const [internalCommentsVisible, setInternalCommentsVisible] = useState(false);
  const [commentsError, setCommentsError] = useState('');

  useEffect(() => {
    if (!review || onToggleComments) {
      return;
    }

    let isMounted = true;
    ReviewService.getComments(review.id)
      .then((nextComments) => {
        if (isMounted) {
          setInternalComments(nextComments);
          setInternalCommentsVisible(true);
          setCommentsError('');
        }
      })
      .catch(() => {
        if (isMounted) {
          setInternalComments([]);
          setInternalCommentsVisible(false);
          setCommentsError('No se pudieron cargar las respuestas.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [review, onToggleComments]);

  useEffect(() => {
    if (!review) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [review, onClose]);

  if (!review) {
    return null;
  }

  const resolvedComments = onToggleComments ? comments : internalComments;
  const resolvedCommentsVisible = onToggleComments ? commentsVisible : internalCommentsVisible;
  const resolvedToggleComments = onToggleComments ?? (() => setInternalCommentsVisible((current) => !current));
  const resolvedCommentsChanged = onCommentsChanged ?? ((_, nextComments) => setInternalComments(nextComments));
  const currentUser = AuthService.getCurrentUser();
  const adminViewingForeignReview = currentUser?.role === ROLES.ADMIN && !review.isOwnReview;

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-detail-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="review-detail-modal-title">Detalle de resena</h2>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Cerrar detalle de resena">
            <PiXBold aria-hidden="true" />
            <span>Cerrar</span>
          </button>
        </div>
        {commentsError && <p className={styles.error}>{commentsError}</p>}
        <ReviewCardComplete
          reviewId={review.id}
          gameCover={review.gameCoverUrl}
          username={review.username}
          userImage={review.userProfileImageUrl || review.profilePicture}
          reviewTitle={review.title}
          reviewDate={new Date(review.createdAt).toLocaleDateString()}
          reviewContent={review.content}
          score={review.rating}
          reviewImage={review.attachmentType === 'image' ? review.attachmentUrl || review.imageUrl : undefined}
          likes={review.likesCount}
          dislikes={review.dislikesCount}
          isOwnReview={review.isOwnReview}
          canDelete={review.canDelete}
          review={review}
          comments={resolvedComments}
          commentsVisible={resolvedCommentsVisible}
          isBusy={isBusy}
          isAuthenticated={isAuthenticated || Boolean(localStorage.getItem('token'))}
          ownerUserId={review.userId}
          votingDisabled={adminViewingForeignReview}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComments={resolvedToggleComments}
          onCommentsChanged={resolvedCommentsChanged}
        />
      </section>
    </div>
  );
};
