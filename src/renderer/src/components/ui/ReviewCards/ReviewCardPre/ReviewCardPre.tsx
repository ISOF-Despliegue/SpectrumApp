import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ReviewCardPre.module.css';
import { ProfileImage } from '../../ProfileImage/ProfileImage';
import { ImageContainer } from '../../ImageContainer/ImageContainer';
import { GameCard } from '../../GameCard/GameCard';
import { ScoreDisplay } from '../../ScoreDisplay/ScoreDisplay';
import { ReviewVoteControls } from '../../ReviewVoteControls';
import { getReviewVotePermission } from '../../../../utilities/reviewVotePermissions';

interface ReviewCardPreProps {
  reviewId?: string;
  gameCover?: string;
  username: string;
  userImage?: string;
  reviewTitle: string;
  reviewContent: string;
  reviewDate: string;
  reviewImage?: string;
  likes: number;
  score?: number;
  dislikes: number;
  isOwnReview?: boolean;
  canVote?: boolean | null;
  userVote?: 'like' | 'dislike' | null;
  context?: 'default' | 'home' | 'profile';
  onClick?: () => void;
}

export const ReviewCardPre: React.FC<ReviewCardPreProps> = ({
  reviewId,
  gameCover,
  username,
  userImage,
  reviewTitle,
  reviewContent,
  reviewDate,
  likes,
  score,
  dislikes,
  reviewImage,
  isOwnReview = false,
  canVote,
  userVote,
  context = 'default',
  onClick
}) => {
  const { t } = useTranslation('gameReviews');
  const votePermission = getReviewVotePermission({ isOwnReview, canVote });

  const handleInternalClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  return (
    <article
      className={`${styles.containerPre} ${context === 'profile' ? styles.profileVariant : ''} ${context === 'home' ? styles.homeVariant : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={t('reviewCard.openDetail')}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className={styles.filmOverlay}></div>

      <section className={styles.gameCol}>
        <GameCard imageUrl={gameCover} />
      </section>

      <section className={styles.infoCol}>
        <div className={styles.userRow}>
          <ProfileImage imageUrl={userImage} />
          <div className={styles.userText}>
            <span className={styles.username}>{username}</span>
            <h3 className={styles.reviewTitle}>{reviewTitle}</h3>
          </div>
        </div>
        <p className={styles.reviewSummary}>{reviewContent}</p>
      </section>

      {reviewImage && (
        <section className={styles.imageCol}>
          <ImageContainer src={reviewImage} width="140px" aspectRatio="16/9" />
        </section>
      )}

      {Number.isFinite(score) && context !== 'home' && (
        <section className={styles.scoreCol}>
          <ScoreDisplay score={score as number} size="small" />
        </section>
      )}

      <section className={styles.actionsCol} onClick={handleInternalClick}>
        <div className={styles.topActions}>
          <time className={styles.date}>{reviewDate}</time>
        </div>

        {Number.isFinite(score) && context === 'home' && (
          <div className={styles.compactScore}>
            <ScoreDisplay score={score as number} size="small" />
          </div>
        )}

        <div className={styles.interactions}>
          {reviewId && (
            <ReviewVoteControls
              reviewId={reviewId}
              likes={likes}
              dislikes={dislikes}
              isOwnReview={isOwnReview}
              userVote={userVote}
              disabled={votePermission.disabled}
              size={context === 'home' ? 'compact' : 'small'}
            />
          )}
        </div>
      </section>
    </article>
  );
};
