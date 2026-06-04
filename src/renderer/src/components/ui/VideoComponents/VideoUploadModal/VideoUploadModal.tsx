import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateVideoMetadata, validateVideoDuration } from '../../../../utilities/videoValidation';
import { startVideoUpload, uploadVideoChunk, completeVideoUpload } from '../../../../services/clips.service';
import { PartEtag } from '../../../../types/media.types';
import { ActionButton } from '../../ActionButton';
import { asApiError, ApiErrorLike } from '../../../../utilities/apiError';
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
  onBackToDetails: () => void;
}

type UploadPhase = 'validating' | 'uploading' | 'success' | 'error';

/**
 * Atomic modal component that orchestrates the AWS S3 multipart video upload sequence.
 * Handles operational transitions through semantic CSS segregation blocks with full internationalization.
 */
export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  file,
  title,
  description,
  gameId,
  onSuccess,
  onClose,
  onBackToDetails
}) => {
  const { t } = useTranslation('videoUpload');
  const [phase, setPhase] = useState<UploadPhase>('validating');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const didFinishRef = useRef(false);

  const chunkLimitSize = 5 * 1024 * 1024;

  const getFriendlyUploadError = (error: ApiErrorLike): string => {
    if (error.response?.status === 503) {
      return 'El servicio de clips no esta disponible. Intentalo de nuevo en unos minutos.';
    }

    if (error.message?.includes('metadata') || error.message?.includes('duration')) {
      return t('form.validationFile');
    }

    return error.response?.data?.title || 'No se pudo subir el clip. Revisa el archivo e intentalo de nuevo.';
  };

  useEffect(() => {
    let isCancelled = false;

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

        const finalVideoUrl = await completeVideoUrlUpload({
          uploadId: initData.uploadId,
          keyName: initData.keyName,
          title: title,
          description: description,
          gameId: gameId,
          etags: etagsList
        });

        setPhase('success');

        setTimeout(() => {
          if (!isCancelled && !didFinishRef.current) {
            didFinishRef.current = true;
            onSuccess(finalVideoUrl);
            onClose();
          }
        }, 1500);

      } catch (error: unknown) {
        if (!isCancelled) {
          const apiError = asApiError(error);
          setPhase('error');
          setErrorMessage(getFriendlyUploadError(apiError));
        }
      }
    };

    const completeVideoUrlUpload = completeVideoUpload;

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

        <div className={styles.statusText}>
          {phase === 'validating' && t('status.validating')}
          {phase === 'uploading' && `${t('status.uploading')} (${progressPercent}%)`}
          {phase === 'success' && <span className={styles.successText}>{t('messages.success')}</span>}

          {phase === 'error' && (
            <div className={styles.errorContainer}>
              <span className={styles.errorText}>
                {t('messages.error')}
              </span>
              <span className={styles.errorDetail}>
                {errorMessage}
              </span>
              <strong className={styles.errorRetry}>
                {t('messages.retry')}
              </strong>
            </div>
          )}
        </div>

        {phase === 'error' && (
          <div className={styles.actionRowLeft}>
            <ActionButton variant="cancel" size="large" onClick={onBackToDetails}>
              {t('actions.close')}
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
};
