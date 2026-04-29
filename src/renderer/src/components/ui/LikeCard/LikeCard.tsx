import React, { useState } from 'react';
import styles from './LikeCard.module.css';

import manoLike from '../../../assets/images/common/manoLike.png';
import manoLikeActive from '../../../assets/images/common/manoLikeActive.png';

interface LikeCardProps {
  initialLikes?: number;
  likedByUser?: boolean;
  onToggle?: (active: boolean) => void;
}

export const LikeCard: React.FC<LikeCardProps> = ({
  initialLikes = 0,
  likedByUser = false,
  onToggle
}) => {
  // Estado local temporal para simular la lógica
  const [active, setActive] = useState(likedByUser);
  const [count, setCount] = useState(initialLikes);

  const handleLike = () => {
    const newState = !active;
    setActive(newState);
    setCount(prev => newState ? prev + 1 : prev - 1);

    // Llamada a la futura función de backend
    if (onToggle) onToggle(newState);
  };

  return (
    <button
      className={`${styles.container} ${active ? styles.activeState : ''}`}
      onClick={handleLike}
    >
      {/* Columna 1: Icono */}
      <div className={styles.iconWrapper}>
        <img
          src={active ? manoLikeActive : manoLike}
          alt="Like icon"
          className={styles.icon}
        />
      </div>

      {/* Columna 2: Contador */}
      <div className={styles.counterWrapper}>
        <span className={styles.counter}>{count}</span>
      </div>
    </button>
  );
};
