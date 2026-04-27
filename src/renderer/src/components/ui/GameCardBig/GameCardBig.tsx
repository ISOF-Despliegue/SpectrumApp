import styles from './GameCardBig.module.css';

interface GameCardBigProps {
  imageUrl?: string;
  onClick: () => void;
}

export const GameCardBig = ({ imageUrl, onClick }: GameCardBigProps) => {
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
