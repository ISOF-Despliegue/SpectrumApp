import React, { useState } from 'react';
import styles from './DislikeCard.module.css';

import manoDislike from '../../../assets/images/common/manoDislike.png';
import manoDislikeActive from '../../../assets/images/common/manoDislikeActive.png';

interface DislikeCardProps {
  initialDislikes?: number;
  count?: number;
  dislikedByUser?: boolean;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  size?: 'small' | 'medium';
  onToggle?: (active: boolean) => void;
}

export const DislikeCard: React.FC<DislikeCardProps> = ({
  initialDislikes = 0,
  count,
  dislikedByUser = false,
  active,
  disabled = false,
  ariaLabel,
  size = 'medium',
  onToggle
}) => {
  const [localActive, setLocalActive] = useState(dislikedByUser);
  const [localCount, setLocalCount] = useState(initialDislikes);
  const displayActive = active ?? localActive;
  const displayCount = count ?? localCount;

  const handleDislike = () => {
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
      onClick={handleDislike}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <div className={styles.iconWrapper}>
        <img
          src={displayActive ? manoDislikeActive : manoDislike}
          alt="Dislike icon"
          className={styles.icon}
        />
      </div>

      <div className={styles.counterWrapper}>
        <span className={styles.counter}>{displayCount}</span>
      </div>
    </button>
  );
};
