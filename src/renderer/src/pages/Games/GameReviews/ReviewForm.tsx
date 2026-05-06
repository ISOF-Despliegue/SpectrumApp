import React from 'react'
import styles from './GameReviews.module.css'

export interface ReviewFormState {
  title: string
  content: string
  rating: number
}

interface ReviewFormProps {
  idPrefix: string
  form: ReviewFormState
  titleLabel: string
  submitLabel: string
  isDisabled: boolean
  maxTitleLength: number
  maxContentLength: number
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onChange: (field: keyof ReviewFormState, value: string | number) => void
  onCancel?: () => void
}

export const ReviewForm = ({
  idPrefix,
  form,
  titleLabel,
  submitLabel,
  isDisabled,
  maxTitleLength,
  maxContentLength,
  onSubmit,
  onChange,
  onCancel
}: ReviewFormProps): React.JSX.Element => (
  <form className={styles.form} onSubmit={onSubmit}>
    <label className={styles.fieldLabel} htmlFor={`${idPrefix}-title`}>
      Titulo
    </label>
    <input
      id={`${idPrefix}-title`}
      className={styles.input}
      type="text"
      value={form.title}
      onChange={(event) => onChange('title', event.target.value)}
      placeholder={titleLabel}
      maxLength={maxTitleLength}
      disabled={isDisabled}
    />

    <label className={styles.fieldLabel} htmlFor={`${idPrefix}-content`}>
      Contenido
    </label>
    <textarea
      id={`${idPrefix}-content`}
      className={styles.textarea}
      value={form.content}
      onChange={(event) => onChange('content', event.target.value)}
      placeholder="Escribe tu opinion del videojuego"
      rows={5}
      maxLength={maxContentLength}
      disabled={isDisabled}
    />

    <label className={styles.fieldLabel} htmlFor={`${idPrefix}-rating`}>
      Calificacion
    </label>
    <input
      id={`${idPrefix}-rating`}
      className={styles.input}
      type="number"
      min={1}
      max={5}
      value={form.rating}
      onChange={(event) => onChange('rating', Number(event.target.value))}
      placeholder="Calificacion"
      disabled={isDisabled}
    />

    <div className={styles.inlineActions}>
      <button className={styles.button} type="submit" disabled={isDisabled}>
        {submitLabel}
      </button>
      {onCancel && (
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={onCancel}
          disabled={isDisabled}
        >
          Cancelar
        </button>
      )}
    </div>
  </form>
)
