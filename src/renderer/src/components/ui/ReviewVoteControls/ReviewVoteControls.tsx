import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReviewService } from '../../../services/reviews.service';
import { DislikeCard } from '../DislikeCard/DislikeCard';
import { LikeCard } from '../LikeCard/LikeCard';
import { useToast } from '../Toast';
import styles from './ReviewVoteControls.module.css';

type Vote = 'like' | 'dislike' | null;

interface ReviewVoteControlsProps {
  reviewId: string;
  likes: number;
  dislikes: number;
  isOwnReview?: boolean;
  size?: 'small' | 'medium';
}

export const ReviewVoteControls = ({
  reviewId,
  likes,
  dislikes,
  isOwnReview = false,
  size = 'medium'
}: ReviewVoteControlsProps): React.JSX.Element => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentDislikes, setCurrentDislikes] = useState(dislikes);
  const [currentVote, setCurrentVote] = useState<Vote>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const castVote = async (isPositive: boolean): Promise<void> => {
    if (isOwnReview) {
      toast.warning(t('reviews.vote.ownReview'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await ReviewService.vote(reviewId, { isPositive });
      setCurrentLikes(result.updatedLikes);
      setCurrentDislikes(result.updatedDislikes);
      setCurrentVote((previous) => {
        const nextVote: Vote = isPositive ? 'like' : 'dislike';
        return previous === nextVote ? null : nextVote;
      });
    } catch (error: any) {
      toast.error(error.response?.data?.title || t('reviews.vote.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.controls}>
      <LikeCard
        count={currentLikes}
        active={currentVote === 'like'}
        disabled={isSubmitting || isOwnReview}
        size={size}
        ariaLabel={t('reviews.vote.like')}
        onToggle={() => { void castVote(true); }}
      />
      <DislikeCard
        count={currentDislikes}
        active={currentVote === 'dislike'}
        disabled={isSubmitting || isOwnReview}
        size={size}
        ariaLabel={t('reviews.vote.dislike')}
        onToggle={() => { void castVote(false); }}
      />
    </div>
  );
};
