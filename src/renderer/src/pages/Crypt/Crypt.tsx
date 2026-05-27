import { useEffect, useState } from 'react';
import { AnalyticsService } from '../../services/analytics.service';
import { CryptDashboard, NamedMetric } from '../../types/analytics.types';
import styles from './Crypt.module.css';

const TileChart = ({ items }: { items: NamedMetric[] }): React.JSX.Element => (
  <div className={styles.tiles}>
    {items.map((item) => (
      <article key={item.id} className={styles.tile}>
        {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" />}
        <strong>{item.label}</strong>
        <span>{item.score > 0 ? item.score.toFixed(1) : `${item.count} resenas`}</span>
      </article>
    ))}
  </div>
);

export const Crypt = (): React.JSX.Element => {
  const [dashboard, setDashboard] = useState<CryptDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        setDashboard(await AnalyticsService.getCryptDashboard());
      } catch {
        setError('No se pudo cargar Ultratumba.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Ultratumba</h1>
        <p>Lo peor del gaming y juegos sin actividad durante el mes actual.</p>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>Cargando graficas...</p>}

      <section className={styles.panel}>
        <h2>TOP 5 PEORES JUEGOS</h2>
        {!isLoading && dashboard?.worstGames.length === 0 && <p className={styles.empty}>No hay calificaciones negativas este mes.</p>}
        <TileChart items={dashboard?.worstGames || []} />
      </section>

      <section className={styles.panel}>
        <h2>JUEGOS DEL MAS ALLA</h2>
        {!isLoading && dashboard?.gamesWithoutReviews.length === 0 && <p className={styles.empty}>Todos los juegos recientes tienen actividad.</p>}
        <TileChart items={dashboard?.gamesWithoutReviews || []} />
      </section>
    </div>
  );
};
