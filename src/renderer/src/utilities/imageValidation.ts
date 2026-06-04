import { ALLOWED_IMAGE_TYPES, FILE_LIMITS } from './validationRules';

/**
 * Validates the file size and mime type of an image.
 * @param file The file object from the input.
 * @returns True if valid, otherwise throws an error.
 */
export const validateImageFile = (file: File): boolean => {
  if (file.size > FILE_LIMITS.imageBytes) {
    throw new Error('La imagen no puede superar los 5 MB.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Formato de imagen invalido. Usa JPG o PNG.');
  }

  return true;
};
