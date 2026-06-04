import type React from 'react';
import { ProfileImage } from '../../ProfileImage';
import { ScoreDisplay } from '../../ScoreDisplay';
import styles from './ProfileReviewPreviewCard.module.css';

interface ProfileReviewPreviewCardProps {
  gameCover?: string | null;
  gameTitle?: string | null;
  username: string;
  userImage?: string | null;
  content: string;
  score: number;
  onClick: () => void;
}

/**
 * Compact profile-only review preview. Full media, actions, and replies stay in ReviewDetailModal.
 */
export const ProfileReviewPreviewCard = ({
  gameCover,
  gameTitle,
  username,
  userImage,
  content,
  score,
  onClick
}: ProfileReviewPreviewCardProps): React.JSX.Element => (
  <article
    className={styles.card}
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    }}
    aria-label={gameTitle ? `${username} - ${gameTitle}` : username}
  >
    <img
      className={styles.cover}
      src={gameCover || 'https://via.placeholder.com/160x220'}
      alt={gameTitle || 'Game cover'}
      loading="lazy"
    />

    <section className={styles.body}>
      <div className={styles.userRow}>
        <ProfileImage imageUrl={userImage || undefined} />
        <div>
          <strong>{username}</strong>
          {gameTitle && <small>{gameTitle}</small>}
        </div>
      </div>
      <p>{content}</p>
    </section>

    <div className={styles.score}>
      <ScoreDisplay score={score} size="small" />
    </div>
  </article>
);
