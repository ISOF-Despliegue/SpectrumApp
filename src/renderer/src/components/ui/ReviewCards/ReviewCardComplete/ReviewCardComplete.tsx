import React from 'react'
import styles from './ReviewCardComplete.module.css'
import { ProfileImage } from '../../ProfileImage/ProfileImage'
import { LikeCard } from '../../LikeCard/LikeCard'
import { DislikeCard } from '../../DislikeCard/DislikeCard'
import { ImageContainer } from '../../ImageContainer/ImageContainer'
import { GameCardMedium } from '../../GameCardMedium/GameCardMedium'
import { ScoreDisplay } from '../../ScoreDisplay/ScoreDisplay'
import { ReportButton } from '../../ReportButton/ReportButton'

interface ReviewCardCompleteProps {
  gameCover?: string
  username: string
  userImage?: string
  reviewTitle: string
  reviewDate: string
  reviewContent: string
  score: number
  reviewImage?: string
  likes: number
  dislikes: number
  isOwnReview?: boolean
  onReport?: () => void
  onLike?: () => void
  onDislike?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onReply?: () => void
  isVoting?: boolean
  isDeleting?: boolean
  canReply?: boolean
  canReport?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canVote?: boolean
  likedByUser?: boolean
  dislikedByUser?: boolean
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
  onLike,
  onDislike,
  onEdit,
  onDelete,
  onReply,
  isVoting = false,
  isDeleting = false,
  canReply,
  canReport,
  canEdit,
  canDelete,
  canVote = true,
  likedByUser = false,
  dislikedByUser = false
}) => {
  const showEdit = Boolean(canEdit && onEdit)
  const showDelete = Boolean(canDelete && onDelete)
  const showReply = Boolean(canReply && onReply)
  const showReport = Boolean(!isOwnReview && (canReport ?? Boolean(onReport)) && onReport)
  const showActions = showEdit || showDelete || showReply || showReport

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
            {canVote && (
              <>
                <LikeCard
                  initialLikes={likes}
                  likes={onLike ? likes : undefined}
                  likedByUser={likedByUser}
                  active={onLike ? likedByUser : undefined}
                  onClick={onLike}
                  disabled={isVoting}
                  size="medium"
                />
                <DislikeCard
                  initialDislikes={dislikes}
                  dislikes={onDislike ? dislikes : undefined}
                  dislikedByUser={dislikedByUser}
                  active={onDislike ? dislikedByUser : undefined}
                  onClick={onDislike}
                  disabled={isVoting}
                  size="medium"
                />
              </>
            )}
          </div>
        </section>

        <section className={styles.scoreColumn}>
          <ScoreDisplay score={score} />
        </section>

        {reviewImage && (
          <section className={styles.imageColumn}>
            <ImageContainer src={reviewImage} width="220px" aspectRatio="16/9" />
          </section>
        )}

        {showActions && (
          <section className={styles.actionsColumn} aria-label="Acciones de reseña">
            {showEdit && (
              <button
                className={styles.actionButton}
                type="button"
                onClick={onEdit}
                disabled={isDeleting}
              >
                Editar
              </button>
            )}

            {showDelete && (
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}

            {showReply && (
              <button className={styles.actionButton} type="button" onClick={onReply}>
                Responder
              </button>
            )}

            {showReport && <ReportButton onClick={onReport} />}
          </section>
        )}
      </div>
    </article>
  )
}
