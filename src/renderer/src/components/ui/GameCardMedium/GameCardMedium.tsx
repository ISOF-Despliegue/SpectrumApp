import type React from 'react';
import styles from './GameCardMedium.module.css';

interface GameCardMediumProps {
  imageUrl?: string;
  alt?: string;
  onClick?: () => void;
}

export const GameCardMedium = ({ imageUrl, alt = 'Game', onClick }: GameCardMediumProps): React.JSX.Element => {
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
