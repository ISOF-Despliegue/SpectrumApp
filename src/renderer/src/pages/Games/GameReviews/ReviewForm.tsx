import type React from 'react';
import { useEffect, useState } from 'react';
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
        <h2>{initialReview ? 'Editar resena' : 'Crear resena'}</h2>
        <button className={styles.iconButton} type="button" onClick={onCancel} aria-label="Cerrar formulario">
          x
        </button>
      </div>

      <label className={styles.field}>
        <span>Titulo</span>
        <input
          value={values.title}
          maxLength={120}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          placeholder="Una mirada clara al juego"
        />
      </label>

      <label className={styles.field}>
        <span>Contenido</span>
        <textarea
          value={values.content}
          maxLength={2000}
          rows={6}
          onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))}
          placeholder="Cuenta que funciona, que falla y para quien lo recomiendas."
        />
      </label>

      <label className={styles.field}>
        <span>Calificacion</span>
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
        <span>Captura o video opcional</span>
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
          Cancelar
        </button>
        <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
