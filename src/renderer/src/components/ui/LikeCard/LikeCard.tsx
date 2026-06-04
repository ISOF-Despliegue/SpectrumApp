import React, { useState } from 'react';
import styles from './LikeCard.module.css';
import manoLike from '../../../assets/images/common/manoLike.png';
import manoLikeActive from '../../../assets/images/common/manoLikeActive.png';

interface LikeCardProps {
  initialLikes?: number;
  count?: number;
  likedByUser?: boolean;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onToggle?: (active: boolean) => void;
  size?: 'compact' | 'small' | 'medium';
}

export const LikeCard: React.FC<LikeCardProps> = ({
  initialLikes = 0,
  count,
  likedByUser = false,
  active,
  disabled = false,
  ariaLabel,
  onToggle,
  size = 'medium'
}) => {
  const [localActive, setLocalActive] = useState(likedByUser);
  const [localCount, setLocalCount] = useState(initialLikes);
  const displayActive = active ?? localActive;
  const displayCount = count ?? localCount;

  const handleLike = () => {
    if (disabled) return;

    const newState = !displayActive;
    if (active === undefined) {
      setLocalActive(newState);
    }
    if (count === undefined) {
      setLocalCount(prev => newState ? prev + 1 : Math.max(0, prev - 1));
    }

    if (onToggle) onToggle(newState);
  };

  return (
    <button
      type="button"
      className={`${styles.container} ${displayActive ? styles.activeState : ''} ${styles[size]}`}
      onClick={handleLike}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <div className={styles.iconWrapper}>
        <img
          src={displayActive ? manoLikeActive : manoLike}
          alt="Like icon"
          className={styles.icon}
        />
      </div>

      <div className={styles.counterWrapper}>
        <span className={styles.counter}>{displayCount}</span>
      </div>
    </button>
  );
};
