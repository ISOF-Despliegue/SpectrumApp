import { api } from './api';
import { MultipartInitResponse, CompleteUploadRequest } from '../types/media.types';

/**
 * Initiates a multipart video upload session by sending the full video file
 * to the backend for metadata and duration validation.
 * @param file The complete video file to be validated and uploaded.
 * @returns A promise resolving to the initialization identifiers from AWS S3.
 */
export const startVideoUpload = async (file: File): Promise<MultipartInitResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<MultipartInitResponse>('/Media/clips/start', formData, {
    transformRequest: (data, headers) => {
      delete headers['Content-Type'];
      return data;
    }
  });

  return response.data;
};

/**
 * Uploads a specific binary chunk of a video file to an active session.
 * @param chunk The blob segment representing the current chunk.
 * @param uploadId The active multipart upload session identifier.
 * @param partNumber The sequential number of the chunk (1-indexed).
 * @param keyName The targeted object path key in the S3 bucket.
 * @returns A promise resolving to the secure ETag string returned by AWS S3.
 */
export const uploadVideoChunk = async (
  chunk: Blob,
  uploadId: string,
  partNumber: number,
  keyName: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', chunk);

  const response = await api.post<{ eTag: string }>('/Media/clips/upload-chunk', formData, {
    params: {
      uploadId,
      partNumber,
      keyName
    },
    transformRequest: (data, headers) => {
      delete headers['Content-Type'];
      return data;
    }
  });

  return response.data.eTag;
};

/**
 * Finalizes the multipart upload session by merging all uploaded chunks
 * and creating the clip database entry in PostgreSQL.
 * @param request The complete assembly payload containing part mappings and metadata.
 * @returns A promise resolving to the final public access URL of the clip.
 */
export const completeVideoUpload = async (request: CompleteUploadRequest): Promise<string> => {
  const response = await api.post<{ url: string }>('/Media/clips/complete', request);
  return response.data.url;
};

/**
 * Deletes a specific game clip from the database and removes its source media file from AWS S3.
 * Permitted only for the clip owner or administrative users.
 * @param clipId The unique identifier (GUID) of the clip to be deleted.
 * @returns A promise resolving to void upon successful deletion.
 */
export const deleteClip = async (clipId: string): Promise<void> => {
  await api.delete(`/Media/clips/${clipId}`);
};
