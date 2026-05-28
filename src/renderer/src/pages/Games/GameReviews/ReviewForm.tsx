import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Review, ReviewFormValues } from '../../../types/reviews.types';
import styles from './GameReviews.module.css';

interface ReviewFormProps {
  initialReview?: Review | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: ReviewFormValues) => Promise<void>;
}

const getInitialValues = (review?: Review | null): ReviewFormValues => ({
  title: review?.title ?? '',
  content: review?.content ?? '',
  rating: review?.rating ?? 5,
  file: null
});

export const ReviewForm = ({
  initialReview,
  isSubmitting,
  onCancel,
  onSubmit
}: ReviewFormProps): React.JSX.Element => {
  const { t } = useTranslation('gameReviews');
  const [values, setValues] = useState<ReviewFormValues>(getInitialValues(initialReview));

  useEffect(() => {
    setValues(getInitialValues(initialReview));
  }, [initialReview]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form className={styles.reviewForm} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <h2>{initialReview ? t('form.editTitle') : t('form.createTitle')}</h2>
        <button className={styles.iconButton} type="button" onClick={onCancel} aria-label={t('form.close')}>
          x
        </button>
      </div>

      <label className={styles.field}>
        <span>{t('form.title')}</span>
        <input
          value={values.title}
          maxLength={120}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          placeholder={t('form.titlePlaceholder')}
        />
      </label>

      <label className={styles.field}>
        <span>{t('form.content')}</span>
        <textarea
          value={values.content}
          maxLength={2000}
          rows={6}
          onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))}
          placeholder={t('form.contentPlaceholder')}
        />
      </label>

      <label className={styles.field}>
        <span>{t('form.rating')}</span>
        <input
          type="number"
          min={5}
          max={10}
          value={values.rating}
          onChange={(event) =>
            setValues((current) => ({ ...current, rating: Number(event.target.value) }))
          }
        />
      </label>

      <label className={styles.field}>
        <span>{t('form.attachment')}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,video/mp4,video/quicktime"
          onChange={(event) =>
            setValues((current) => ({ ...current, file: event.target.files?.[0] ?? null }))
          }
        />
      </label>

      <div className={styles.formActions}>
        <button className={styles.secondaryButton} type="button" onClick={onCancel}>
          {t('form.cancel')}
        </button>
        <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('form.saving') : t('form.save')}
        </button>
      </div>
    </form>
  );
};
