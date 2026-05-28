import type React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './GameReviews.module.css';

interface RatingPanelProps {
  averageRating: number | null;
  reviewsCount: number;
  onCreateReview: () => void;
}

export const RatingPanel = ({
  averageRating,
  reviewsCount,
  onCreateReview
}: RatingPanelProps): React.JSX.Element => {
  const { t } = useTranslation('gameReviews');
  return (
    <aside className={styles.sidePanel}>
      <p className={styles.eyebrow}>{t('rating.eyebrow')}</p>
      <div className={styles.averageBox}>
        {averageRating === null ? (
          <span className={styles.emptyRating}>{t('rating.noRating')}</span>
        ) : (
          <>
            <strong>{averageRating.toFixed(1)}</strong>
            <span>/10</span>
          </>
        )}
      </div>
      <p className={styles.ratingHint}>
        {t('rating.count', { count: reviewsCount })}
      </p>
      <button className={styles.primaryButton} type="button" onClick={onCreateReview}>
        {t('rating.create')}
      </button>
    </aside>
  );
};
