import type React from 'react';
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
  return (
    <aside className={styles.sidePanel}>
      <p className={styles.eyebrow}>Promedio</p>
      <div className={styles.averageBox}>
        {averageRating === null ? (
          <span className={styles.emptyRating}>Sin calificacion</span>
        ) : (
          <>
            <strong>{averageRating.toFixed(1)}</strong>
            <span>/10</span>
          </>
        )}
      </div>
      <p className={styles.ratingHint}>
        {reviewsCount === 1 ? '1 resena publicada' : `${reviewsCount} resenas publicadas`}
      </p>
      <button className={styles.primaryButton} type="button" onClick={onCreateReview}>
        Crear resena
      </button>
    </aside>
  );
};
