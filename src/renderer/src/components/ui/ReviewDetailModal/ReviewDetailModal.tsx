import { useEffect, useState } from 'react';
import type { Review, ReviewComment } from '../../../types/reviews.types';
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
        }
      })
      .catch(() => {
        if (isMounted) {
          setInternalComments([]);
          setInternalCommentsVisible(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [review, onToggleComments]);

  if (!review) {
    return null;
  }

  const resolvedComments = onToggleComments ? comments : internalComments;
  const resolvedCommentsVisible = onToggleComments ? commentsVisible : internalCommentsVisible;
  const resolvedToggleComments = onToggleComments ?? (() => setInternalCommentsVisible((current) => !current));
  const resolvedCommentsChanged = onCommentsChanged ?? ((_, nextComments) => setInternalComments(nextComments));

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <section className={styles.dialog} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className={styles.close} type="button" onClick={onClose}>x</button>
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
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComments={resolvedToggleComments}
          onCommentsChanged={resolvedCommentsChanged}
        />
      </section>
    </div>
  );
};
