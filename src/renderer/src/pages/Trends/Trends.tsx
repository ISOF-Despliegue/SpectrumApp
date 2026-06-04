import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Trends.module.css';
import { AnalyticsService } from '../../services/analytics.service';
import { NamedMetric, TrendsDashboard } from '../../types/analytics.types';
import { resolvePlatformIcon } from '../../components/ui/ProfileComponents/PlatformSelectionModal';
import { TrendBarChart, TrendChartEntry } from '../../components/ui/TrendBarChart';

const getMetricImage = (item: NamedMetric, kind?: 'game' | 'user' | 'console'): string | undefined => {
  if (kind === 'console') {
    return resolvePlatformIcon(
      item.platformName || item.consoleName || item.label,
      item.iconUrl || item.platformIconUrl || item.imageUrl
    );
  }

  return item.coverImageUrl || item.profileImageUrl || item.iconUrl || item.imageUrl || undefined;
};

const getMetricLabel = (item: NamedMetric, kind?: 'game' | 'user' | 'console'): string => {
  if (kind === 'console') {
    return item.platformName || item.consoleName || item.label || item.id;
  }

  if (kind === 'user') {
    return item.username || item.label || item.id;
  }

  return item.gameTitle || item.label || item.id;
};

const toChartEntry = ({
  item,
  kind,
  valueKey = 'count',
  onClick,
  label
}: {
  item: NamedMetric;
  kind: 'game' | 'user' | 'console';
  valueKey?: 'count' | 'score';
  onClick?: () => void;
  label?: string;
}): TrendChartEntry => {
  const value = Number(item[valueKey]) || 0;
  return {
    id: item.id,
    label: label || getMetricLabel(item, kind),
    value,
    valueLabel: valueKey === 'score' ? value.toFixed(1) : String(value),
    imageUrl: getMetricImage(item, kind),
    onClick
  };
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
            <TrendBarChart
              ariaLabel={t('sections.weeklyTrend')}
              emptyMessage={t('emptyStatistic')}
              imageShape="cover"
              items={dashboard.weeklyInteractions.map((item) =>
                toChartEntry({
                  item,
                  kind: 'game',
                  onClick: item.gameId ? () => navigate(`/games/${item.gameId}/reviews`) : undefined
                })
              )}
            />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.weeklyDiscussions')}</h2>
            <TrendBarChart
              ariaLabel={t('sections.weeklyDiscussions')}
              emptyMessage={t('emptyStatistic')}
              imageShape="cover"
              items={dashboard.weeklyDiscussions.map((review) => ({
                id: review.reviewId,
                label: review.title || review.gameTitle,
                meta: `${review.username} - ${review.gameTitle}`,
                value: review.commentsCount + review.likesCount,
                valueLabel: t('discussionMeta', {
                  comments: review.commentsCount,
                  likes: review.likesCount
                }),
                imageUrl: review.gameCoverUrl,
                onClick: () => navigate(`/games/${review.gameId}/reviews`)
              }))}
            />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.worstOfWeek')}</h2>
            <TrendBarChart
              ariaLabel={t('sections.worstOfWeek')}
              emptyMessage={t('emptyStatistic')}
              imageShape="cover"
              items={dashboard.worstOfWeek.map((item) =>
                toChartEntry({
                  item,
                  kind: 'game',
                  valueKey: 'score',
                  onClick: item.gameId ? () => navigate(`/games/${item.gameId}/reviews`) : undefined
                })
              )}
            />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.bestOfWeek')}</h2>
            <TrendBarChart
              ariaLabel={t('sections.bestOfWeek')}
              emptyMessage={t('emptyStatistic')}
              imageShape="cover"
              items={dashboard.bestOfWeek.map((item) =>
                toChartEntry({
                  item,
                  kind: 'game',
                  valueKey: 'score',
                  onClick: item.gameId ? () => navigate(`/games/${item.gameId}/reviews`) : undefined
                })
              )}
            />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.consoleOfMonth')}</h2>
            <TrendBarChart
              ariaLabel={t('sections.consoleOfMonth')}
              emptyMessage={t('emptyStatistic')}
              imageShape="icon"
              items={dashboard.consoleOfMonth.map((item) => toChartEntry({ item, kind: 'console' }))}
            />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.topReviewersOfMonth')}</h2>
            <TrendBarChart
              ariaLabel={t('sections.topReviewersOfMonth')}
              emptyMessage={t('emptyStatistic')}
              imageShape="avatar"
              items={dashboard.topReviewersOfMonth.map((item) =>
                toChartEntry({
                  item,
                  kind: 'user',
                  valueKey: 'score',
                  onClick: item.userId ? () => navigate(`/users/${item.userId}`) : undefined
                })
              )}
            />
          </article>

          <article className={`${styles.panel} ${styles.wide}`}>
            <h2>{t('sections.genresOfMonth')}</h2>
            <TrendBarChart
              ariaLabel={t('sections.genresOfMonth')}
              emptyMessage={t('emptyStatistic')}
              imageShape="icon"
              items={dashboard.genresOfMonth.map((item) =>
                toChartEntry({
                  item,
                  kind: 'console',
                  label: t(`genres.${item.id}`, { defaultValue: item.label || t('genreUnavailable') })
                })
              )}
            />
          </article>
        </section>
      )}
    </div>
  );
};
