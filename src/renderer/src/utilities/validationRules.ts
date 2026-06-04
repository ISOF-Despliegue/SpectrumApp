export const FIELD_LIMITS = {
  username: 50,
  email: 254,
  password: 128,
  shortText: 120,
  mediumText: 300,
  longText: 500,
  reviewContent: 2000,
  commentContent: 500,
  reportDescription: 500,
  clipTitle: 120,
  clipDescription: 500,
  dropCodes: 2000,
  phone: 20,
  rfc: 13,
  address: 180
} as const;

export const FILE_LIMITS = {
  imageBytes: 5 * 1024 * 1024,
  videoBytes: 60 * 1024 * 1024
} as const;

export const ALLOWED_IMAGE_TYPES: readonly string[] = ['image/png', 'image/jpeg', 'image/jpg'];
export const ALLOWED_VIDEO_TYPES: readonly string[] = ['video/mp4', 'video/quicktime'];
export const ALLOWED_VIDEO_EXTENSIONS: readonly string[] = ['.mp4', '.mov'];

export const bytesToMegabytes = (bytes: number): number => Math.floor(bytes / (1024 * 1024));

/**
 * Keeps form limits consistent across independently mounted frontend flows.
 * Returns a display-ready Spanish error so callers can show it without mapping codes.
 */
export const validateTextLength = (
  value: string,
  maxLength: number,
  fieldLabel: string
): string | null => {
  if (value.trim().length > maxLength) {
    return `${fieldLabel} no puede superar los ${maxLength} caracteres.`;
  }

  return null;
};
