import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api'; // Tu instancia base de Axios
import { validateVideoMetadata } from '../../../../utilities/videoValidation';
import { VideoUploadModal } from './VideoUploadModal';
import styles from './VideoUploadModal.module.css';

interface GameLookupDto {
  id: string;
  title: string;
}

interface ClipUploadFlowModalProps {
  onClose: () => void;
  onRefreshClips: () => void;
}

type FlowStep = 'selectGame' | 'fillDetails' | 'uploading';

export const ClipUploadFlowModal: React.FC<ClipUploadFlowModalProps> = ({
  onClose,
  onRefreshClips
}) => {
  const { t } = useTranslation('videoUpload');
  const [currentStep, setCurrentStep] = useState<FlowStep>('selectGame');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gamesList, setGamesList] = useState<GameLookupDto[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameLookupDto | null>(null);

  const [clipTitle, setClipTitle] = useState<string>('');
  const [clipDescription, setClipDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [gameError, setGameError] = useState<string>('');
  const [titleError, setTitleError] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setGamesList([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await api.get<GameLookupDto[]>('/games', {
          params: { search: searchQuery }
        });
        setGamesList(response.data);
      } catch (error) {
        setGamesList([]);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  /**
   * Validates Step 1 and advances to Step 2.
   */
  const handleNextStep = (): void => {
    if (!selectedGame) {
      setGameError(t('form.validationGame'));
      return;
    }
    setGameError('');
    setCurrentStep('fillDetails');
  };

  /**
   * Handles local file selection and triggers early inline validation.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileError('');
      validateVideoMetadata(file);
      setSelectedFile(file);
    } catch (error: any) {
      setSelectedFile(null);
      setFileError(error.message || t('form.validationFile'));
    }
  };

  /**
   * Validates Step 2 fields and triggers the final upload phase.
   */
  const handleSubmitFlow = (): void => {
    let hasErrors = false;

    if (clipTitle.trim() === '') {
      setTitleError(t('form.validationTitle'));
      hasErrors = true;
    } else {
      setTitleError('');
    }

    if (!selectedFile) {
      setFileError(t('form.validationFile'));
      hasErrors = true;
    }

    if (hasErrors) return;

    setCurrentStep('uploading');
  };

  if (currentStep === 'uploading' && selectedFile && selectedGame) {
    return (
      <VideoUploadModal
        file={selectedFile}
        title={clipTitle}
        description={clipDescription}
        gameId={selectedGame.id}
        onSuccess={onRefreshClips}
        onClose={onClose}
      />
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <button className={styles.modalCloseX} onClick={onClose}>×</button>

        <h2 className={styles.modalTitle}>{t('title')}</h2>

        {currentStep === 'selectGame' && (
          <div className={styles.stepWrapper}>
            <span className={styles.stepIndicator}>{t('form.stepGame')}</span>

            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.formInput}
                placeholder={t('form.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {gameError && <span className={styles.inlineErrorLabel}>{gameError}</span>}
            </div>

            {gamesList.length > 0 && (
              <ul className={styles.searchResultsList}>
                {gamesList.map((game) => (
                  <li
                    key={game.id}
                    className={`${styles.searchResultItem} ${selectedGame?.id === game.id ? styles.itemSelected : ''}`}
                    onClick={() => {
                      setSelectedGame(game);
                      setSearchQuery(game.title);
                      setGamesList([]);
                    }}
                  >
                    {game.title}
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.actionRowButton}>
              <button className={styles.primaryActionButton} onClick={handleNextStep}>
                {t('actions.next')}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'fillDetails' && (
          <div className={styles.stepWrapper}>
            <span className={styles.stepIndicator}>{t('form.stepDetails')}</span>

            <p className={styles.selectedGameBadge}>
              <strong>Juego:</strong> {selectedGame?.title}
            </p>

            <div className={styles.inputGroup}>
              <label className={styles.formLabel}>{t('form.titleLabel')}</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder={t('form.titlePlaceholder')}
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
              />
              {titleError && <span className={styles.inlineErrorLabel}>{titleError}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.formLabel}>{t('form.descriptionLabel')}</label>
              <textarea
                className={styles.formTextarea}
                placeholder={t('form.descriptionPlaceholder')}
                value={clipDescription}
                onChange={(e) => setClipDescription(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.formLabel}>{t('form.fileLabel')}</label>
              <input
                type="file"
                accept=".mp4,.mov"
                className={styles.formFileInput}
                onChange={handleFileChange}
              />
              {fileError && <span className={styles.inlineErrorLabel}>{fileError}</span>}

              <div className={styles.requirementsBox}>
                <p>{t('requirements.formats')}</p>
                <p>{t('requirements.size')}</p>
                <p>{t('requirements.duration')}</p>
              </div>
            </div>

            <div className={styles.actionRowButton}>
              <button className={styles.secondaryActionButton} onClick={() => setCurrentStep('selectGame')}>
                {t('actions.back')}
              </button>
              <button className={styles.primaryActionButton} onClick={handleSubmitFlow}>
                {t('actions.submit')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
