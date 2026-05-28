import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Trends.module.css';
import { AnalyticsService } from '../../services/analytics.service';
import { NamedMetric, TrendsDashboard } from '../../types/analytics.types';

const MetricBars = ({ items, valueKey = 'count' }: { items: NamedMetric[]; valueKey?: 'count' | 'score' }): React.JSX.Element => {
  const { t } = useTranslation('trends');
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);
  return (
    <div className={styles.bars}>
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0;
        return (
          <div className={styles.barRow} key={item.id}>
            <span>{t(`genres.${item.id}`, { defaultValue: item.label || t('genreUnavailable') })}</span>
            <div><i style={{ width: `${Math.max(8, (value / max) * 100)}%` }} /></div>
            <strong>{valueKey === 'score' ? value.toFixed(1) : value}</strong>
          </div>
        );
      })}
    </div>
  );
};

export const Trends = (): React.JSX.Element => {
  const { t } = useTranslation('trends');
  const navigate = useNavigate();
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
        setError(t('loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [t]);

  const hasData = dashboard && (
    dashboard.weeklyInteractions.length > 0 ||
    dashboard.weeklyDiscussions.length > 0 ||
    dashboard.worstOfWeek.length > 0 ||
    dashboard.bestOfWeek.length > 0
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>{t('loading')}</p>}
      {!isLoading && !hasData && <p className={styles.empty}>{t('empty')}</p>}

      {dashboard && (
        <section className={styles.dashboardGrid}>
          <article className={styles.panel}>
            <h2>{t('sections.weeklyTrend')}</h2>
            <MetricBars items={dashboard.weeklyInteractions} />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.weeklyDiscussions')}</h2>
            <div className={styles.discussionList}>
              {dashboard.weeklyDiscussions.map((review) => (
                <button
                  type="button"
                  key={review.reviewId}
                  onClick={() => navigate(`/games/${review.gameId}/reviews`)}
                  aria-label={t('openReview', { title: review.title })}
                >
                  <strong>{review.title}</strong>
                  <span>{review.gameTitle} - {review.username}</span>
                  <small>{t('discussionMeta', { comments: review.commentsCount, likes: review.likesCount })}</small>
                </button>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.worstOfWeek')}</h2>
            <MetricBars items={dashboard.worstOfWeek} valueKey="score" />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.bestOfWeek')}</h2>
            <MetricBars items={dashboard.bestOfWeek} valueKey="score" />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.consoleOfMonth')}</h2>
            <MetricBars items={dashboard.consoleOfMonth} />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.topReviewersOfMonth')}</h2>
            <MetricBars items={dashboard.topReviewersOfMonth} valueKey="score" />
          </article>

          <article className={`${styles.panel} ${styles.wide}`}>
            <h2>{t('sections.genresOfMonth')}</h2>
            <MetricBars items={dashboard.genresOfMonth} />
          </article>
        </section>
      )}
    </div>
  );
};
