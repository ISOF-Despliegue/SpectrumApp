/**
 * Represents the response when initiating a multipart upload session.
 */
export interface MultipartInitResponse {
  uploadId: string;
  keyName: string;
}

/**
 * Represents the tracking metadata for an individual uploaded chunk.
 */
export interface PartEtag {
  partNumber: number;
  eTag: string;
}

/**
 * Represents the final contract required to assemble the video and persist it in PostgreSQL.
 */
export interface CompleteUploadRequest {
  uploadId: string;
  keyName: string;
  title: string;
  description?: string;
  gameId: string;
  etags: PartEtag[];
}
