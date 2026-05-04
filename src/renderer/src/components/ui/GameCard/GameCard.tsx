import styles from './GameCard.module.css';

interface GameCardProps {
  imageUrl?: string;
  onClick?: () => void;
}

export const GameCard = ({ imageUrl, onClick }: GameCardProps) => {
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
