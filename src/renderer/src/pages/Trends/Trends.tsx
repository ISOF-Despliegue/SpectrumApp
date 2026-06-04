import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Trends.module.css';
import { AnalyticsService } from '../../services/analytics.service';
import { NamedMetric, TrendsDashboard } from '../../types/analytics.types';
import { GameCardMedium } from '../../components/ui/GameCardMedium';
import { ProfileImage } from '../../components/ui/ProfileImage';
import { ImageContainer } from '../../components/ui/ImageContainer';
import { ReviewCardPre } from '../../components/ui/ReviewCards/ReviewCardPre';

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

const getMetricImage = (item: NamedMetric): string | undefined =>
  item.coverImageUrl || item.profileImageUrl || item.iconUrl || item.imageUrl || undefined;

const VisualMetricCard = ({
  item,
  kind,
  valueKey = 'count',
  onClick
}: {
  item: NamedMetric;
  kind: 'game' | 'user' | 'console';
  valueKey?: 'count' | 'score';
  onClick?: () => void;
}): React.JSX.Element => {
  const value = Number(item[valueKey]) || 0;
  const imageUrl = getMetricImage(item);
  const label = item.username || item.label || item.id;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!onClick) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${styles.visualCard} ${onClick ? styles.visualCardInteractive : ''}`}
      role={onClick ? 'button' : 'group'}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.visualMedia}>
        {kind === 'user' ? (
          <ProfileImage imageUrl={imageUrl} />
        ) : kind === 'game' && imageUrl ? (
          <GameCardMedium imageUrl={imageUrl} />
        ) : imageUrl ? (
          <ImageContainer src={imageUrl} alt={label} width="72px" height="72px" aspectRatio="1/1" />
        ) : (
          <span className={styles.metricFallback}>{label.trim().charAt(0).toUpperCase() || 'S'}</span>
        )}
      </span>
      <span className={styles.visualText}>
        <strong>{label}</strong>
        <small>{valueKey === 'score' ? value.toFixed(1) : value}</small>
      </span>
    </div>
  );
};

const VisualMetricList = ({
  items,
  kind,
  valueKey = 'count',
  onOpen
}: {
  items: NamedMetric[];
  kind: 'game' | 'user' | 'console';
  valueKey?: 'count' | 'score';
  onOpen?: (item: NamedMetric) => void;
}): React.JSX.Element => (
  <div className={styles.visualList}>
    {items.map((item) => (
      <VisualMetricCard
        key={item.id}
        item={item}
        kind={kind}
        valueKey={valueKey}
        onClick={onOpen ? () => onOpen(item) : undefined}
      />
    ))}
  </div>
);

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
            <VisualMetricList
              items={dashboard.weeklyInteractions}
              kind="game"
              onOpen={(item) => {
                if (item.gameId) navigate(`/games/${item.gameId}/reviews`);
              }}
            />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.weeklyDiscussions')}</h2>
            <div className={styles.discussionList}>
              {dashboard.weeklyDiscussions.map((review) => (
                <ReviewCardPre
                  key={review.reviewId}
                  reviewId={review.reviewId}
                  gameCover={review.gameCoverUrl}
                  username={review.username}
                  reviewTitle={review.title}
                  reviewContent={review.content}
                  reviewDate={new Date(review.createdAt).toLocaleDateString()}
                  reviewImage={review.attachmentType === 'image' ? review.attachmentUrl : undefined}
                  likes={review.likesCount}
                  dislikes={review.dislikesCount}
                  isOwnReview={review.isOwnContent}
                  onClick={() => navigate(`/games/${review.gameId}/reviews`)}
                />
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.worstOfWeek')}</h2>
            <VisualMetricList
              items={dashboard.worstOfWeek}
              kind="game"
              valueKey="score"
              onOpen={(item) => {
                if (item.gameId) navigate(`/games/${item.gameId}/reviews`);
              }}
            />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.bestOfWeek')}</h2>
            <VisualMetricList
              items={dashboard.bestOfWeek}
              kind="game"
              valueKey="score"
              onOpen={(item) => {
                if (item.gameId) navigate(`/games/${item.gameId}/reviews`);
              }}
            />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.consoleOfMonth')}</h2>
            <VisualMetricList items={dashboard.consoleOfMonth} kind="console" />
          </article>

          <article className={styles.panel}>
            <h2>{t('sections.topReviewersOfMonth')}</h2>
            <VisualMetricList
              items={dashboard.topReviewersOfMonth}
              kind="user"
              valueKey="score"
              onOpen={(item) => {
                if (item.userId) navigate(`/users/${item.userId}`);
              }}
            />
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
