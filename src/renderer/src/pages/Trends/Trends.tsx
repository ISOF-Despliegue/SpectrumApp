import { useEffect, useState } from 'react';
import styles from './Trends.module.css';
import { AnalyticsService } from '../../services/analytics.service';
import { NamedMetric, TrendsDashboard } from '../../types/analytics.types';

const MetricBars = ({ items, valueKey = 'count' }: { items: NamedMetric[]; valueKey?: 'count' | 'score' }): React.JSX.Element => {
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);
  return (
    <div className={styles.bars}>
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0;
        return (
          <div className={styles.barRow} key={item.id}>
            <span>{item.label}</span>
            <div><i style={{ width: `${Math.max(8, (value / max) * 100)}%` }} /></div>
            <strong>{valueKey === 'score' ? value.toFixed(1) : value}</strong>
          </div>
        );
      })}
    </div>
  );
};

export const Trends = (): React.JSX.Element => {
  const [dashboard, setDashboard] = useState<TrendsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        setDashboard(await AnalyticsService.getTrendsDashboard());
      } catch {
        setError('No se pudieron cargar las tendencias.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const hasData = dashboard && (
    dashboard.weeklyInteractions.length > 0 ||
    dashboard.weeklyDiscussions.length > 0 ||
    dashboard.worstOfWeek.length > 0 ||
    dashboard.bestOfWeek.length > 0
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Tendencia</h1>
        <p>Graficas calculadas por ventanas de semana y mes desde el backend.</p>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>Cargando tendencias...</p>}
      {!isLoading && !hasData && <p className={styles.empty}>Aun no hay actividad suficiente para graficar.</p>}

      {dashboard && (
        <section className={styles.dashboardGrid}>
          <article className={styles.panel}>
            <h2>Tendencia semanal</h2>
            <MetricBars items={dashboard.weeklyInteractions} />
          </article>

          <article className={styles.panel}>
            <h2>Discusiones de la semana</h2>
            <div className={styles.discussionList}>
              {dashboard.weeklyDiscussions.map((review) => (
                <div key={review.reviewId}>
                  <strong>{review.title}</strong>
                  <span>{review.gameTitle} - {review.username}</span>
                  <small>{review.commentsCount} comentarios - {review.likesCount} likes</small>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <h2>Lo peor de la semana</h2>
            <MetricBars items={dashboard.worstOfWeek} valueKey="score" />
          </article>

          <article className={styles.panel}>
            <h2>Lo mejor de la semana</h2>
            <MetricBars items={dashboard.bestOfWeek} valueKey="score" />
          </article>

          <article className={styles.panel}>
            <h2>Consola del mes</h2>
            <MetricBars items={dashboard.consoleOfMonth} />
          </article>

          <article className={styles.panel}>
            <h2>Top resenadores del mes</h2>
            <MetricBars items={dashboard.topReviewersOfMonth} valueKey="score" />
          </article>

          <article className={`${styles.panel} ${styles.wide}`}>
            <h2>Generos con mas interaccion</h2>
            <MetricBars items={dashboard.genresOfMonth} />
          </article>
        </section>
      )}
    </div>
  );
};
