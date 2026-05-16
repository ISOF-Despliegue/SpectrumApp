import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateVideoMetadata, validateVideoDuration } from '../../../../utilities/videoValidation';
import { startVideoUpload, uploadVideoChunk, completeVideoUpload } from '../../../../services/clips.service';
import { PartEtag } from '../../../../types/media.types';
import styles from './VideoUploadModal.module.css';

/**
 * Properties required for the VideoUploadModal component.
 */
interface VideoUploadModalProps {
  file: File;
  title: string;
  description?: string;
  gameId: string;
  onSuccess: (videoUrl: string) => void;
  onClose: () => void;
}

/**
 * Types of operational phases during the upload sequence.
 */
type UploadPhase = 'validating' | 'uploading' | 'success' | 'error';

/**
 * Atomic modal component that orchestrates the AWS S3 multipart video upload sequence.
 * Provides abstract progress feedback without exposing technical chunk logistics to the user.
 */
export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  file,
  title,
  description,
  gameId,
  onSuccess,
  onClose
}) => {
  const { t } = useTranslation('videoUpload');
  const [phase, setPhase] = useState<UploadPhase>('validating');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const chunkLimitSize = 5 * 1024 * 1024;

  useEffect(() => {
    let isCancelled = false;

    /**
     * Executes the sequential validation, chunking, and assembly process.
     */
    const executeUploadProcess = async (): Promise<void> => {
      try {
        setPhase('validating');
        validateVideoMetadata(file);
        await validateVideoDuration(file);

        if (isCancelled) return;

        const initData = await startVideoUpload(file);

        if (isCancelled) return;
        setPhase('uploading');

        let currentByte = 0;
        let partNumber = 1;
        const etagsList: PartEtag[] = [];

        while (currentByte < file.size) {
          if (isCancelled) return;

          const currentEnd = Math.min(currentByte + chunkLimitSize, file.size);
          const videoChunk = file.slice(currentByte, currentEnd);

          const eTag = await uploadVideoChunk(
            videoChunk,
            initData.uploadId,
            partNumber,
            initData.keyName
          );

          etagsList.push({
            partNumber: partNumber,
            eTag: eTag
          });

          const calculatedProgress = Math.round((currentEnd / file.size) * 100);
          setProgressPercent(calculatedProgress);

          currentByte += chunkLimitSize;
          partNumber++;
        }

        if (isCancelled) return;

        const finalVideoUrl = await completeVideoUpload({
          uploadId: initData.uploadId,
          keyName: initData.keyName,
          title: title,
          description: description,
          gameId: gameId,
          etags: etagsList
        });

        setPhase('success');

        setTimeout(() => {
          if (!isCancelled) {
            onSuccess(finalVideoUrl);
            onClose();
          }
        }, 1500);

      } catch (error: any) {
        if (!isCancelled) {
          setPhase('error');
          setErrorMessage(error.response?.data?.detail || error.message || 'Unknown upload error.');
        }
      }
    };

    executeUploadProcess();

    return () => {
      isCancelled = true;
    };
  }, [file, gameId, title, description]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h3 className={styles.modalTitle}>{t('title')}</h3>

        {(phase === 'validating' || phase === 'uploading') && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        <p className={styles.statusText}>
          {phase === 'validating' && t('status.validating')}
          {phase === 'uploading' && t('status.uploading')}
          {phase === 'success' && <span className={styles.successText}>{t('messages.success')}</span>}
          {phase === 'error' && (
            <span className={styles.errorText}>
              {t('messages.error')}
              <span className={styles.errorDetail}>{errorMessage}</span>
            </span>
          )}
        </p>

        {phase === 'error' && (
          <button onClick={onClose} className={styles.closeButton}>
            {t('actions.close')}
          </button>
        )}
      </div>
    </div>
  );
};
