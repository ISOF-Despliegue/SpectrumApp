import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReviewService } from '../../../services/reviews.service';
import { DislikeCard } from '../DislikeCard/DislikeCard';
import { LikeCard } from '../LikeCard/LikeCard';
import { useToast } from '../Toast';
import { asApiError } from '../../../utilities/apiError';
import styles from './ReviewVoteControls.module.css';

type Vote = 'like' | 'dislike' | null;

interface ReviewVoteControlsProps {
  reviewId: string;
  likes: number;
  dislikes: number;
  isOwnReview?: boolean;
  userVote?: Vote;
  currentUserVote?: Vote;
  myVote?: Vote;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export const ReviewVoteControls = ({
  reviewId,
  likes,
  dislikes,
  isOwnReview = false,
  userVote,
  currentUserVote,
  myVote,
  disabled = false,
  size = 'medium'
}: ReviewVoteControlsProps): React.JSX.Element => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const initialVote = currentUserVote ?? userVote ?? myVote ?? null;
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentDislikes, setCurrentDislikes] = useState(dislikes);
  const [currentVote, setCurrentVote] = useState<Vote>(initialVote);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentLikes(likes);
    setCurrentDislikes(dislikes);
  }, [likes, dislikes]);

  useEffect(() => {
    setCurrentVote(currentUserVote ?? userVote ?? myVote ?? null);
  }, [currentUserVote, userVote, myVote]);

  const castVote = async (isPositive: boolean): Promise<void> => {
    if (disabled || isOwnReview) {
      toast.warning(t('reviews.vote.ownReview'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await ReviewService.vote(reviewId, { isPositive });
      const nextVote: Vote = isPositive ? 'like' : 'dislike';
      setCurrentLikes(result.updatedLikes);
      setCurrentDislikes(result.updatedDislikes);
      setCurrentVote((previous) => {
        return previous === nextVote ? null : nextVote;
      });
    } catch (error: unknown) {
      const apiError = asApiError(error);
      const status = apiError.response?.status;
      toast.error(status === 503 ? 'El servicio de votos no esta disponible. Intentalo de nuevo en unos minutos.' : apiError.response?.data?.title || t('reviews.vote.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.controls}>
      <LikeCard
        count={currentLikes}
        active={currentVote === 'like'}
        disabled={isSubmitting || disabled || isOwnReview}
        size={size}
        ariaLabel={t('reviews.vote.like')}
        onToggle={() => { void castVote(true); }}
      />
      <DislikeCard
        count={currentDislikes}
        active={currentVote === 'dislike'}
        disabled={isSubmitting || disabled || isOwnReview}
        size={size}
        ariaLabel={t('reviews.vote.dislike')}
        onToggle={() => { void castVote(false); }}
      />
    </div>
  );
};
