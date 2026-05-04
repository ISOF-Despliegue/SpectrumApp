import React, { useState } from 'react';
import styles from './DislikeCard.module.css';

import manoDislike from '../../../assets/images/common/manoDislike.png';
import manoDislikeActive from '../../../assets/images/common/manoDislikeActive.png';

interface DislikeCardProps {
  initialDislikes?: number;
  dislikedByUser?: boolean;
  onToggle?: (active: boolean) => void;
}

export const DislikeCard: React.FC<DislikeCardProps> = ({
  initialDislikes = 0,
  dislikedByUser = false,
  onToggle
}) => {
  const [active, setActive] = useState(dislikedByUser);
  const [count, setCount] = useState(initialDislikes);

  const handleDislike = () => {
    const newState = !active;
    setActive(newState);
    setCount(prev => newState ? prev + 1 : prev - 1);

    if (onToggle) onToggle(newState);
  };

  return (
    <button
      className={`${styles.container} ${active ? styles.activeState : ''}`}
      onClick={handleDislike}
    >
      <div className={styles.iconWrapper}>
        <img
          src={active ? manoDislikeActive : manoDislike}
          alt="Dislike icon"
          className={styles.icon}
        />
      </div>

      <div className={styles.counterWrapper}>
        <span className={styles.counter}>{count}</span>
      </div>
    </button>
  );
};
