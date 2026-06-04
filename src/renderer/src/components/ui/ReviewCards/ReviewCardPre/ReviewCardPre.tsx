import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ReviewCardPre.module.css';
import { ProfileImage } from '../../ProfileImage/ProfileImage';
import { ImageContainer } from '../../ImageContainer/ImageContainer';
import { GameCard } from '../../GameCard/GameCard';
import { ScoreDisplay } from '../../ScoreDisplay/ScoreDisplay';
import { ReviewVoteControls } from '../../ReviewVoteControls';

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
  userVote?: 'like' | 'dislike' | null;
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
  userVote,
  onClick
}) => {
  const { t } = useTranslation('gameReviews');

  const handleInternalClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  return (
    <article
      className={styles.containerPre}
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

      {Number.isFinite(score) && (
        <section className={styles.scoreCol}>
          <ScoreDisplay score={score as number} size="small" />
        </section>
      )}

      <section className={styles.actionsCol} onClick={handleInternalClick}>
        <div className={styles.topActions}>
          <time className={styles.date}>{reviewDate}</time>
        </div>

        <div className={styles.interactions}>
          {reviewId && (
            <ReviewVoteControls
              reviewId={reviewId}
              likes={likes}
              dislikes={dislikes}
              isOwnReview={isOwnReview}
              userVote={userVote}
              size="small"
            />
          )}
        </div>
      </section>
    </article>
  );
};
