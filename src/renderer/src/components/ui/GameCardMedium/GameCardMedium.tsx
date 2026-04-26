import styles from './GameCardMedium.module.css';

interface GameCardMediumProps {
  imageUrl?: string;
  onClick: () => void;
}

export const GameCardMedium = ({ imageUrl, onClick }: GameCardMediumProps) => {
  const defaultImage = "https://via.placeholder.com/150";

  return (
    <button
      className={styles.gameCard}
      onClick={onClick}
    >
      <img
        src={imageUrl || defaultImage}
        alt="Game"
        className={styles.gameCardImage}
      />
    </button>
  );
};
