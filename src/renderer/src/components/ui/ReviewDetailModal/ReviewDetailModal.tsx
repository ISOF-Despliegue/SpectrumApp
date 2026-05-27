import type { Review } from '../../../types/reviews.types';
import { ReviewCardComplete } from '../ReviewCards/ReviewCardComplete';
import styles from './ReviewDetailModal.module.css';

interface ReviewDetailModalProps {
  review: Review | null;
  onClose: () => void;
}

export const ReviewDetailModal = ({ review, onClose }: ReviewDetailModalProps): React.JSX.Element | null => {
  if (!review) {
    return null;
  }

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
        />
      </section>
    </div>
  );
};
