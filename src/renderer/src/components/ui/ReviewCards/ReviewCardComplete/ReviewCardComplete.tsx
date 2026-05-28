import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ReviewCardComplete.module.css';
import { ProfileImage } from '../../ProfileImage/ProfileImage';
import { ImageContainer } from '../../ImageContainer/ImageContainer';
import { GameCardMedium } from '../../GameCardMedium/GameCardMedium';
import { ScoreDisplay } from '../../ScoreDisplay/ScoreDisplay';
import { ReportButton } from '../../ReportButton/ReportButton';
import { ReportModal } from '../../ReportModal/ReportModal';
import { ReviewVoteControls } from '../../ReviewVoteControls';
import { ConfirmationModal } from '../../ConfirmationModal';
import { useToast } from '../../Toast';
import { ReviewComments } from '../../../../pages/Games/GameReviews/ReviewComments';
import type { Review, ReviewComment } from '../../../../types/reviews.types';

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
  canDelete?: boolean;
  review?: Review;
  comments?: ReviewComment[];
  commentsVisible?: boolean;
  isBusy?: boolean;
  isAuthenticated?: boolean;
  ownerUserId?: string;
  currentUserId?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => Promise<void> | void;
  onToggleComments?: (reviewId: string) => void;
  onCommentsChanged?: (reviewId: string, comments: ReviewComment[]) => void;
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
  canDelete = false,
  review,
  comments = [],
  commentsVisible = false,
  isBusy = false,
  isAuthenticated = false,
  ownerUserId,
  currentUserId,
  onEdit,
  onDelete,
  onToggleComments,
  onCommentsChanged
}) => {
  const { t } = useTranslation(['gameReviews', 'common']);
  const toast = useToast();
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isOwnerMenuOpen, setIsOwnerMenuOpen] = React.useState(false);
  const canEditReview = isOwnReview && review && onEdit;
  const canDeleteReview = isOwnReview && canDelete && onDelete;

  const confirmDelete = async (): Promise<void> => {
    if (!onDelete) {
      return;
    }

    try {
      await onDelete(reviewId);
      toast.success(t('gameReviews:messages.deleted'));
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.title || t('gameReviews:errors.generic'));
    }
  };

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
            {!isOwnReview && (
              <ReviewVoteControls
                reviewId={reviewId}
                likes={likes}
                dislikes={dislikes}
                isOwnReview={isOwnReview}
              />
            )}
            {onToggleComments && (
              <button
                className={styles.actionButton}
                type="button"
                disabled={isBusy}
                onClick={() => onToggleComments(reviewId)}
              >
                {commentsVisible ? t('gameReviews:reviewCard.hideReplies') : t('gameReviews:reviewCard.viewReplies')}
              </button>
            )}
            {isAuthenticated && onToggleComments && (
              <button
                className={styles.actionButton}
                type="button"
                disabled={isBusy}
                onClick={() => onToggleComments(reviewId)}
              >
                {t('gameReviews:reviewCard.reply')}
              </button>
            )}
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
        {isOwnReview && (canEditReview || canDeleteReview) && (
          <section className={styles.ownerMenuColumn}>
            <button
              className={styles.menuButton}
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOwnerMenuOpen}
              onClick={() => setIsOwnerMenuOpen((current) => !current)}
            >
              ...
            </button>
            {isOwnerMenuOpen && (
              <div className={styles.ownerMenu} role="menu">
                {canEditReview && (
                  <button type="button" role="menuitem" onClick={() => onEdit(review)}>
                    {t('gameReviews:reviewCard.edit')}
                  </button>
                )}
                {canDeleteReview && (
                  <button type="button" role="menuitem" onClick={() => setIsDeleteModalOpen(true)}>
                    {t('gameReviews:reviewCard.delete')}
                  </button>
                )}
              </div>
            )}
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
      {commentsVisible && onCommentsChanged && (
        <div className={styles.repliesSection}>
          <ReviewComments
            reviewId={reviewId}
            comments={comments}
            isAuthenticated={isAuthenticated}
            onMessage={(message) => toast.info(message)}
            onCommentsChanged={(nextComments) => onCommentsChanged(reviewId, nextComments)}
          />
        </div>
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title={t('gameReviews:reviewCard.deleteConfirmTitle')}
        message={t('gameReviews:reviewCard.deleteConfirmMessage')}
        confirmLabel={t('gameReviews:reviewCard.delete')}
        cancelLabel={t('gameReviews:form.cancel')}
        variant="danger"
        onConfirm={() => { void confirmDelete(); }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </article>
  );
};
