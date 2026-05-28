import React from 'react';
import styles from './ReviewCardComplete.module.css';
import { ProfileImage } from '../../ProfileImage/ProfileImage';
import { ImageContainer } from '../../ImageContainer/ImageContainer';
import { GameCardMedium } from '../../GameCardMedium/GameCardMedium';
import { ScoreDisplay } from '../../ScoreDisplay/ScoreDisplay';
import { ReportButton } from '../../ReportButton/ReportButton';
import { ReportModal } from '../../ReportModal/ReportModal';
import { ReviewVoteControls } from '../../ReviewVoteControls';

interface ReviewCardCompleteProps {
  reviewId: string;
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
  ownerUserId?: string;
  currentUserId?: string;
}

export const ReviewCardComplete: React.FC<ReviewCardCompleteProps> = ({
  reviewId,
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
  ownerUserId,
  currentUserId
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);

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
            <ReviewVoteControls
              reviewId={reviewId}
              likes={likes}
              dislikes={dislikes}
              isOwnReview={isOwnReview}
            />
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
            <ReportButton onClick={() => setIsReportModalOpen(true)} />
          </section>
        )}
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={reviewId}
        targetType='REVIEW'
        currentUserId={currentUserId}
        targetOwnerId={ownerUserId}
      />
    </article>
  );
};
