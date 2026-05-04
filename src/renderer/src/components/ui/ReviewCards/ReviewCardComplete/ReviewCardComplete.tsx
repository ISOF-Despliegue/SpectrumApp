import React from 'react';
import styles from './ReviewCardComplete.module.css';
import { ProfileImage } from '../../ProfileImage/ProfileImage';
import { LikeCard } from '../../LikeCard/LikeCard';
import { DislikeCard } from '../../DislikeCard/DislikeCard';
import { ImageContainer } from '../../ImageContainer/ImageContainer';
import { GameCardMedium } from '../../GameCardMedium/GameCardMedium';
import { ScoreDisplay } from '../../ScoreDisplay/ScoreDisplay';
import { ReportButton } from '../../ReportButton/ReportButton';

interface ReviewCardCompleteProps {
  gameCover?: string;
  username: string;
  userImage?: string;
  reviewTitle: string;
  reviewDate: string;
  reviewContent: string;
  score: number;
  reviewImage?: string;
  likes: number;
  dislikes: number;
  isOwnReview?: boolean;
  onReport?: () => void;
}

export const ReviewCardComplete: React.FC<ReviewCardCompleteProps> = ({
  gameCover,
  username,
  userImage,
  reviewTitle,
  reviewDate,
  reviewContent,
  score,
  reviewImage,
  likes,
  dislikes,
  isOwnReview = false,
  onReport,
}) => {
  return (
    <article className={styles.container}>
      <div className={styles.filmOverlay}></div>

      <div className={styles.mainContent}>
        <section className={styles.gameColumn}>
          <GameCardMedium imageUrl={gameCover} />
        </section>

        <section className={styles.reviewBodyColumn}>
          <div className={styles.userDateRow}>
            <div className={styles.userInfo}>
              <ProfileImage imageUrl={userImage} />
              <span className={styles.username}>{username}</span>
            </div>
            <time className={styles.dateText}>{reviewDate}</time>
          </div>

          <div className={styles.textContent}>
            <h2 className={styles.reviewTitle}>{reviewTitle}</h2>
            <p className={styles.reviewText}>{reviewContent}</p>
          </div>

          <div className={styles.interactionsRow}>
            <LikeCard initialLikes={likes} size="medium"/>
            <DislikeCard initialDislikes={dislikes} size="medium"/>
          </div>
        </section>

        <section className={styles.scoreColumn}>
          <ScoreDisplay score={score} />
        </section>

        {reviewImage && (
          <section className={styles.imageColumn}>
            <ImageContainer
              src={reviewImage}
              width="220px"
              aspectRatio="16/9"
            />
          </section>
        )}

        {!isOwnReview && (
          <section className={styles.reportColumn}>
            <ReportButton onClick={onReport} />
          </section>
        )}
      </div>
    </article>
  );
};
