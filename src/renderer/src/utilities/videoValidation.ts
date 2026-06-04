import {
  ALLOWED_VIDEO_EXTENSIONS,
  ALLOWED_VIDEO_TYPES,
  bytesToMegabytes,
  FILE_LIMITS
} from './validationRules';

const MAX_VIDEO_DURATION = 16;

/**
 * Validates the file size and extension of a video.
 * @param file The file object from the input.
 * @returns True if valid, otherwise throws an error.
 */
export const validateVideoMetadata = (file: File, maxSizeBytes = FILE_LIMITS.videoBytes): boolean => {
  if (file.size > maxSizeBytes) {
    throw new Error(`El video no puede superar los ${bytesToMegabytes(maxSizeBytes)} MB.`);
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error('Formato de video invalido. Usa MP4 o MOV.');
  }

  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_VIDEO_EXTENSIONS.includes(fileExtension)) {
    throw new Error('Formato de video invalido. Usa MP4 o MOV.');
  }

  return true;
};

/**
 * Validates the actual playtime duration of a video file.
 * @param file The file object from the input.
 * @returns A promise that resolves to true if duration is valid.
 */
export const validateVideoDuration = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';

    videoElement.onloadedmetadata = (): void => {
      window.URL.revokeObjectURL(videoElement.src);

      if (videoElement.duration > MAX_VIDEO_DURATION) {
        reject(new Error('El video no puede superar los 15 segundos.'));
      }
      resolve(true);
    };

    videoElement.onerror = (): void => {
      window.URL.revokeObjectURL(videoElement.src);
      reject(new Error('No se pudo leer la informacion del video.'));
    };

    videoElement.src = window.URL.createObjectURL(file);
  });
};
