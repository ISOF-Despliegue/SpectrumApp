import type React from 'react';
import type { Game } from '../../../services/games.service';
import styles from './GameReviews.module.css';

interface GameSummaryProps {
  game: Game;
}

export const GameSummary = ({ game }: GameSummaryProps): React.JSX.Element => {
  const releaseDate = game.releaseDate || game.released;

  return (
    <aside className={styles.sidePanel}>
      <p className={styles.eyebrow}>Videojuego</p>
      <h1 className={styles.gameTitle}>{game.title}</h1>
      {game.imageUrl && <img className={styles.cover} src={game.imageUrl} alt={game.title} />}
      <dl className={styles.metaList}>
        <div>
          <dt>ID</dt>
          <dd>{game.id}</dd>
        </div>
        {releaseDate && (
          <div>
            <dt>Lanzamiento</dt>
            <dd>{new Date(releaseDate).toLocaleDateString()}</dd>
          </div>
        )}
        {game.developer && (
          <div>
            <dt>Desarrollador</dt>
            <dd>{game.developer}</dd>
          </div>
        )}
      </dl>
    </aside>
  );
};
