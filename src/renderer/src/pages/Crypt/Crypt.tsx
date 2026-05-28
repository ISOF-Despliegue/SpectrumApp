import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnalyticsService } from '../../services/analytics.service';
import { CryptDashboard, NamedMetric } from '../../types/analytics.types';
import { ScoreDisplay } from '../../components/ui/ScoreDisplay/ScoreDisplay';
import { useToast } from '../../components/ui/Toast';
import styles from './Crypt.module.css';
import backgroundCrypt from '../../assets/images/backgroundCrypt.png';
import ghostFriky from '../../assets/images/ghostFriky.png';
import lapidaGeneral from '../../assets/images/lapidaGeneral.png';
import lapidaTop from '../../assets/images/lapidaTop.png';

const TombstoneGrid = ({
  items,
  variant
}: {
  items: NamedMetric[];
  variant: 'top' | 'general';
}): React.JSX.Element => {
  const { t } = useTranslation('crypt');
  const navigate = useNavigate();

  return (
    <div className={variant === 'top' ? styles.topTombs : styles.generalTombs}>
      {items.map((item) => {
        const score = item.score > 0 ? Math.round(item.score * 10) : 0;
        return (
          <button
            type="button"
            key={item.id}
            className={`${styles.tombstone} ${variant === 'top' ? styles.topTombstone : styles.generalTombstone}`}
            onClick={() => navigate(`/games/${item.id}/reviews`)}
            aria-label={t('openGame', { name: item.label })}
          >
            <img className={styles.tombImage} src={variant === 'top' ? lapidaTop : lapidaGeneral} alt="" loading="lazy" />
            <span className={styles.gamePortrait}>
              {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" />}
            </span>
            <strong>{item.label}</strong>
            {item.score > 0 ? (
              <ScoreDisplay score={score} size="small" />
            ) : (
              <span className={styles.noReviews}>{t('noReviews', { count: item.count })}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const Crypt = (): React.JSX.Element => {
  const { t } = useTranslation('crypt');
  const toast = useToast();
  const [dashboard, setDashboard] = useState<CryptDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        setDashboard(await AnalyticsService.getCryptDashboard());
      } catch {
        toast.error(t('loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [t, toast]);

  return (
    <div className={styles.page} style={{ backgroundImage: `url(${backgroundCrypt})` }}>
      <header className={styles.header}>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>

      {isLoading && <p className={styles.loading}>{t('loading')}</p>}

      <section className={`${styles.panel} ${styles.worstPanel}`}>
        <img className={styles.ghost} src={ghostFriky} alt="" loading="lazy" />
        <h2>{t('worstTitle')}</h2>
        {!isLoading && dashboard?.worstGames.length === 0 && <p className={styles.empty}>{t('emptyWorst')}</p>}
        <TombstoneGrid items={dashboard?.worstGames || []} variant="top" />
      </section>

      <section className={styles.panel}>
        <h2>{t('restTitle')}</h2>
        {!isLoading && dashboard?.gamesWithoutReviews.length === 0 && <p className={styles.empty}>{t('emptyRest')}</p>}
        <TombstoneGrid items={dashboard?.gamesWithoutReviews || []} variant="general" />
      </section>
    </div>
  );
};
