import type React from 'react';
import styles from './GameCard.module.css';

interface GameCardProps {
  imageUrl?: string;
  alt?: string;
  onClick?: () => void;
}

export const GameCard = ({ imageUrl, alt = 'Game', onClick }: GameCardProps): React.JSX.Element => {
  const defaultImage = "https://via.placeholder.com/150";

  return (
    <button
      className={styles.gameCard}
      onClick={onClick}
    >
      <img
        src={imageUrl || defaultImage}
        alt={alt}
        className={styles.gameCardImage}
        loading="lazy"
      />
    </button>
  );
};
