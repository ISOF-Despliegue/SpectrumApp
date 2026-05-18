/**
 * Utility functions for validating image files before uploading to AWS S3.
 */

const MAX_IMAGE_SIZE = 6 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

/**
 * Validates the file size and mime type of an image.
 * @param file The file object from the input.
 * @returns True if valid, otherwise throws an error.
 */
export const validateImageFile = (file: File): boolean => {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image size exceeds the 5MB limit.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid image format. Only PNG, JPEG, and JPG are allowed.');
  }

  return true;
};
