import type { ReviewFormValues } from '../types/reviews.types';
import { validateImageFile } from './imageValidation';
import { validateVideoMetadata } from './videoValidation';

const MAX_REVIEW_CONTENT_LENGTH = 2000;
const MAX_COMMENT_LENGTH = 500;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

export const validateReviewForm = (values: ReviewFormValues): string | null => {
  if (!values.title.trim()) {
    return 'El titulo de la resena es obligatorio.';
  }

  if (!values.content.trim()) {
    return 'El contenido de la resena es obligatorio.';
  }

  if (values.content.trim().length > MAX_REVIEW_CONTENT_LENGTH) {
    return 'La resena no puede superar los 2000 caracteres.';
  }

  if (!Number.isFinite(values.rating) || values.rating < 5 || values.rating > 10) {
    return 'La calificacion debe estar entre 5 y 10.';
  }

  if (values.file) {
    return validateReviewAttachment(values.file);
  }

  return null;
};

export const validateComment = (content: string): string | null => {
  if (!content.trim()) {
    return 'El comentario es obligatorio.';
  }

  if (content.trim().length > MAX_COMMENT_LENGTH) {
    return 'El comentario no puede superar los 500 caracteres.';
  }

  return null;
};

export const validateReviewAttachment = (file: File): string | null => {
  try {
    if (file.type.startsWith('image/')) {
      validateImageFile(file);
      return null;
    }

    if (file.type.startsWith('video/')) {
      validateVideoMetadata(file, MAX_VIDEO_SIZE);
      return null;
    }

    return 'Adjunta solo archivos JPG, PNG, MP4 o MOV.';
  } catch (error) {
    return error instanceof Error ? error.message : 'El archivo seleccionado no es valido.';
  }
};
