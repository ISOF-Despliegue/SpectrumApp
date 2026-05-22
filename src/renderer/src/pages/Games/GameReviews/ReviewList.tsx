import type React from 'react';
import type { Review, ReviewComment } from '../../../types/reviews.types';
import { ReviewCard } from './ReviewCard';
import styles from './GameReviews.module.css';

interface ReviewListProps {
  reviews: Review[];
  commentsByReviewId: Record<string, ReviewComment[]>;
  visibleComments: Set<string>;
  isBusy: boolean;
  isAuthenticated: boolean;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
  onVote: (reviewId: string, isPositive: boolean) => void;
  onToggleComments: (reviewId: string) => void;
  onCommentsChanged: (reviewId: string, comments: ReviewComment[]) => void;
  onMessage: (message: string) => void;
}

export const ReviewList = ({
  reviews,
  commentsByReviewId,
  visibleComments,
  isBusy,
  isAuthenticated,
  onEdit,
  onDelete,
  onVote,
  onToggleComments,
  onCommentsChanged,
  onMessage
}: ReviewListProps): React.JSX.Element => {
  if (reviews.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No hay resenas todavia</h2>
        <p>Publica la primera opinion de este videojuego.</p>
      </div>
    );
  }

  return (
    <section className={styles.reviewList}>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          comments={commentsByReviewId[review.id] ?? []}
          commentsVisible={visibleComments.has(review.id)}
          isBusy={isBusy}
          isAuthenticated={isAuthenticated}
          onEdit={onEdit}
          onDelete={onDelete}
          onVote={onVote}
          onToggleComments={onToggleComments}
          onCommentsChanged={onCommentsChanged}
          onMessage={onMessage}
        />
      ))}
    </section>
  );
};
