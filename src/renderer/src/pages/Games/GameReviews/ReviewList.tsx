import type React from 'react';
import { useTranslation } from 'react-i18next';
import type { Review } from '../../../types/reviews.types';
import { ReviewCardPre } from '../../../components/ui/ReviewCards/ReviewCardPre';
import styles from './GameReviews.module.css';

interface ReviewListProps {
  reviews: Review[];
  onOpenReview: (review: Review) => void;
}

export const ReviewList = ({
  reviews,
  onOpenReview
}: ReviewListProps): React.JSX.Element => {
  const { t } = useTranslation('gameReviews');

  if (reviews.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>{t('empty.title')}</h2>
        <p>{t('empty.body')}</p>
      </div>
    );
  }

  return (
    <section className={styles.reviewList}>
      {reviews.map((review) => (
        <ReviewCardPre
          key={review.id}
          reviewId={review.id}
          gameCover={review.gameCoverUrl}
          username={review.username}
          userImage={review.userProfileImageUrl || review.profilePicture}
          reviewTitle={review.title}
          reviewContent={review.content}
          reviewDate={new Date(review.createdAt).toLocaleDateString()}
          reviewImage={review.attachmentType === 'image' ? review.attachmentUrl || review.imageUrl : undefined}
          likes={review.likesCount}
          dislikes={review.dislikesCount}
          score={review.rating}
          isOwnReview={review.isOwnReview}
          onClick={() => onOpenReview(review)}
        />
      ))}
    </section>
  );
};
