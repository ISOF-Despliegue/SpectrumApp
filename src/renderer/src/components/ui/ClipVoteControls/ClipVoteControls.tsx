import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { voteClip } from '../../../services/clips.service';
import { DislikeCard } from '../DislikeCard/DislikeCard';
import { LikeCard } from '../LikeCard/LikeCard';
import { useToast } from '../Toast';
import styles from '../ReviewVoteControls/ReviewVoteControls.module.css';

type Vote = 'like' | 'dislike' | null;

interface ClipVoteControlsProps {
  clipId: string;
  likes: number;
  dislikes: number;
  userVote?: Vote;
  isOwnClip?: boolean;
  size?: 'small' | 'medium';
}

export const ClipVoteControls = ({
  clipId,
  likes,
  dislikes,
  userVote = null,
  isOwnClip = false,
  size = 'medium'
}: ClipVoteControlsProps): React.JSX.Element => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentDislikes, setCurrentDislikes] = useState(dislikes);
  const [currentVote, setCurrentVote] = useState<Vote>(userVote);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const castVote = async (isPositive: boolean): Promise<void> => {
    if (isOwnClip) {
      toast.warning(t('clips.vote.ownClip'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await voteClip(clipId, isPositive);
      const nextVote: Vote = isPositive ? 'like' : 'dislike';
      setCurrentLikes(result.updatedLikes);
      setCurrentDislikes(result.updatedDislikes);
      setCurrentVote((previous) => (previous === nextVote ? null : nextVote));
    } catch (error: any) {
      toast.error(error.response?.data?.title || t('clips.vote.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.controls}>
      <LikeCard
        count={currentLikes}
        active={currentVote === 'like'}
        disabled={isSubmitting || isOwnClip}
        size={size}
        ariaLabel={t('clips.vote.like')}
        onToggle={() => { void castVote(true); }}
      />
      <DislikeCard
        count={currentDislikes}
        active={currentVote === 'dislike'}
        disabled={isSubmitting || isOwnClip}
        size={size}
        ariaLabel={t('clips.vote.dislike')}
        onToggle={() => { void castVote(false); }}
      />
    </div>
  );
};
