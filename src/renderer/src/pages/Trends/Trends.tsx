import { useEffect, useState } from 'react';
import styles from './Trends.module.css';
import { AnalyticsService } from '../../services/analytics.service';
import { WeeklyTrends } from '../../types/analytics.types';

export const Trends = (): React.JSX.Element => {
  const [trends, setTrends] = useState<WeeklyTrends | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        setTrends(await AnalyticsService.getWeeklyTrends());
      } catch {
        setError('No se pudieron cargar las tendencias.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Tendencias semanales</h1>
        <p>Top 3 de videojuegos con mas resenas publicadas en la semana actual.</p>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>Cargando tendencias...</p>}
      {!isLoading && trends?.games.length === 0 && <p className={styles.empty}>Aun no hay actividad suficiente esta semana.</p>}

      <section className={styles.grid}>
        {trends?.games.map((game) => (
          <article className={styles.gameCard} key={game.gameId}>
            {game.coverImageUrl && <img src={game.coverImageUrl} alt="" loading="lazy" />}
            <div className={styles.cardBody}>
              <span className={styles.rank}>#{game.rank}</span>
              <h2>{game.gameTitle}</h2>
              <p>{game.reviewsCount} resenas esta semana</p>
              <div className={styles.reviewList}>
                {game.reviews.map((review) => (
                  <div className={styles.review} key={review.reviewId}>
                    <strong>{review.title}</strong>
                    <span>{review.username} · {review.likesCount} likes</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
