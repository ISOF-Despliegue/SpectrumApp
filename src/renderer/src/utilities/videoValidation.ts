/**
 * Utility functions for validating video files before uploading to AWS S3.
 */

const MAX_VIDEO_SIZE = 60 * 1024 * 1024;
const MAX_VIDEO_DURATION = 15;
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov'];

/**
 * Validates the file size and extension of a video.
 * @param file The file object from the input.
 * @returns True if valid, otherwise throws an error.
 */
export const validateVideoMetadata = (file: File): boolean => {
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error('Video size exceeds the 60MB limit.');
  }

  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_VIDEO_EXTENSIONS.includes(fileExtension)) {
    throw new Error('Invalid video format. Only .mp4 and .mov are allowed.');
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
        reject(new Error('Video duration exceeds the 15-second limit.'));
      }
      resolve(true);
    };

    videoElement.onerror = (): void => {
      window.URL.revokeObjectURL(videoElement.src);
      reject(new Error('Could not read video file metadata.'));
    };

    videoElement.src = window.URL.createObjectURL(file);
  });
};
