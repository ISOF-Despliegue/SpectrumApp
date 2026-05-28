import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './GlobalMetrics.module.css';
import { AnalyticsService } from '../../../services/analytics.service';
import { GlobalMetrics, MetricPoint } from '../../../types/analytics.types';

const today = new Date().toISOString().slice(0, 10);

const MiniBarChart = ({ title, points }: { title: string; points: MetricPoint[] }): React.JSX.Element => {
  const { t } = useTranslation('admin');
  const max = Math.max(...points.map((point) => point.count), 1);

  return (
    <section className={styles.panel}>
      <h3>{title}</h3>
      {points.length === 0 ? (
        <p className={styles.empty}>{t('globalMetrics.emptyPeriod')}</p>
      ) : (
        <div className={styles.chart}>
          {points.map((point) => (
            <div className={styles.barItem} key={`${title}-${point.label}`}>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ height: `${Math.max(8, (point.count / max) * 100)}%` }} />
              </div>
              <span>{point.label}</span>
              <strong>{point.count}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export const AdminGlobalMetrics = (): React.JSX.Element => {
  const { t } = useTranslation('admin');
  const [period, setPeriod] = useState('week');
  const [anchorDate, setAnchorDate] = useState(today);
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        setMetrics(await AnalyticsService.getGlobalMetrics(period, anchorDate));
      } catch {
        setError(t('globalMetrics.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [period, anchorDate, t]);

  const totalUsers = useMemo(
    () => metrics?.newUsers.reduce((sum, point) => sum + point.count, 0) ?? 0,
    [metrics]
  );
  const totalReviews = useMemo(
    () => metrics?.newReviews.reduce((sum, point) => sum + point.count, 0) ?? 0,
    [metrics]
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t('globalMetrics.title')}</h1>
          <p>{t('globalMetrics.subtitle')}</p>
        </div>
        <div className={styles.filters}>
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="day">{t('globalMetrics.periods.day')}</option>
            <option value="week">{t('globalMetrics.periods.week')}</option>
            <option value="month">{t('globalMetrics.periods.month')}</option>
          </select>
          <input type="date" value={anchorDate} onChange={(event) => setAnchorDate(event.target.value)} />
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>{t('globalMetrics.loading')}</p>}

      {metrics && !isLoading && (
        <>
          <section className={styles.summaryGrid}>
            <div className={styles.panel}>
              <span>{t('globalMetrics.cards.newUsers')}</span>
              <strong>{totalUsers}</strong>
            </div>
            <div className={styles.panel}>
              <span>{t('globalMetrics.cards.newReviews')}</span>
              <strong>{totalReviews}</strong>
            </div>
            <div className={styles.panel}>
              <span>{t('globalMetrics.cards.window')}</span>
              <strong>{new Date(metrics.windowStart).toLocaleDateString()} - {new Date(metrics.windowEnd).toLocaleDateString()}</strong>
            </div>
          </section>

          <section className={styles.grid}>
            <MiniBarChart title={t('globalMetrics.charts.newUsers')} points={metrics.newUsers} />
            <MiniBarChart title={t('globalMetrics.charts.newReviews')} points={metrics.newReviews} />
          </section>

          <section className={styles.panel}>
            <h3>{t('globalMetrics.cards.mostSearchedGames')}</h3>
            {metrics.mostSearchedGames.length === 0 ? (
              <p className={styles.empty}>{t('globalMetrics.emptyGames')}</p>
            ) : (
              <div className={styles.gameList}>
                {metrics.mostSearchedGames.map((game) => (
                  <article className={styles.gameRow} key={game.gameId}>
                    {game.coverImageUrl && <img src={game.coverImageUrl} alt="" loading="lazy" />}
                    <span>{game.gameTitle}</span>
                    <strong>{game.count}</strong>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
