import type React from 'react';
import type { Review, ReviewComment } from '../../../types/reviews.types';
import { ReviewCardComplete } from '../../../components/ui/ReviewCards/ReviewCardComplete';

interface ReviewCardProps {
  review: Review;
  comments: ReviewComment[];
  commentsVisible: boolean;
  isBusy: boolean;
  isAuthenticated: boolean;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => Promise<void> | void;
  onToggleComments: (reviewId: string) => void;
  onCommentsChanged: (reviewId: string, comments: ReviewComment[]) => void;
}

export const ReviewCard = ({
  review,
  comments,
  commentsVisible,
  isBusy,
  isAuthenticated,
  onEdit,
  onDelete,
  onToggleComments,
  onCommentsChanged
}: ReviewCardProps): React.JSX.Element => (
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
    comments={comments}
    commentsVisible={commentsVisible}
    isBusy={isBusy}
    isAuthenticated={isAuthenticated}
    ownerUserId={review.userId}
    onEdit={onEdit}
    onDelete={onDelete}
    onToggleComments={onToggleComments}
    onCommentsChanged={onCommentsChanged}
  />
);
