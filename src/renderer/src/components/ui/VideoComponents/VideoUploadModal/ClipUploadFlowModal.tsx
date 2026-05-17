import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';
import { validateVideoMetadata } from '../../../../utilities/videoValidation';
import { VideoUploadModal } from './VideoUploadModal';
import { ActionButton } from '../../ActionButton';
import styles from './ClipUploadFlowModal.module.css';

interface GameLookupDto {
  id: string;
  title: string;
}

interface PagedGamesResponse {
  items?: GameLookupDto[];
  results?: GameLookupDto[];
}

interface ClipUploadFlowModalProps {
  onClose: () => void;
  onRefreshClips: () => void;
  gameId?: string;
  gameTitle?: string;
}

type FlowStep = 'selectGame' | 'fillDetails' | 'uploading';

export const ClipUploadFlowModal: React.FC<ClipUploadFlowModalProps> = ({
  onClose,
  onRefreshClips,
  gameId,
  gameTitle
}) => {
  const { t } = useTranslation(['videoUpload', 'common']);

  const [currentStep, setCurrentStep] = useState<FlowStep>(
    gameId ? 'fillDetails' : 'selectGame'
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [gamesList, setGamesList] = useState<GameLookupDto[]>([]);

  const [selectedGame, setSelectedGame] = useState<GameLookupDto | null>(
    gameId && gameTitle ? { id: gameId, title: gameTitle } : null
  );

  const [clipTitle, setClipTitle] = useState<string>('');
  const [clipDescription, setClipDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [gameError, setGameError] = useState<string>('');
  const [titleError, setTitleError] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  useEffect(() => {
    if (gameId) return;

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await api.get<PagedGamesResponse>('/games/search', {
          params: {
            search: searchQuery,
            sortBy: sortBy
          }
        });
        const gamesResultArray = response.data.items || response.data.results || [];
        setGamesList(gamesResultArray);
      } catch (error) {
        setGamesList([]);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, sortBy, gameId]);

  const handleNextStep = (): void => {
    if (!selectedGame) {
      setGameError(t('videoUpload:form.validationGame'));
      return;
    }
    setGameError('');
    setCurrentStep('fillDetails');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setFileError('');
      validateVideoMetadata(file);
      setSelectedFile(file);
    } catch (error: any) {
      setSelectedFile(null);
      setFileError(error.message || t('videoUpload:form.validationFile'));
    }
  };

  const handleNextStepSubmit = (): void => {
    let hasErrors = false;

    if (clipTitle.trim() === '') {
      setTitleError(t('videoUpload:form.validationTitle'));
      hasErrors = true;
    } else {
      setTitleError('');
    }

    if (!selectedFile) {
      setFileError(t('videoUpload:form.validationFile'));
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

        <h2 className={styles.modalTitle}>{t('videoUpload:title')}</h2>

        {currentStep === 'selectGame' && !gameId && (
          <div className={styles.stepWrapper}>
            <span className={styles.stepIndicator}>{t('videoUpload:form.stepGame')}</span>

            <div className={styles.catalogFiltersRow}>
              <div className={styles.catalogSearchBox}>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder={t('common:searchers.searchByName')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className={styles.catalogSortBox}>
                <label className={styles.catalogSortLabel}>{t('common:filters.sortBy')}</label>
                <select
                  className={styles.formSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">{t('common:filters.options.default')}</option>
                  <option value="nameAsc">{t('common:filters.options.nameAsc')}</option>
                  <option value="nameDesc">{t('common:filters.options.nameDesc')}</option>
                  <option value="dateNew">{t('common:filters.options.dateNew')}</option>
                  <option value="dateOld">{t('common:filters.options.dateOld')}</option>
                  <option value="ratingDesc">{t('common:filters.options.ratingDesc')}</option>
                </select>
              </div>
            </div>

            {gameError && <span className={styles.inlineErrorLabel} style={{ marginBottom: '10px' }}>{gameError}</span>}

            <div className={styles.gamesCatalogGrid}>
              {gamesList.map((game) => (
                <div
                  key={game.id}
                  className={`${styles.gameCatalogCard} ${selectedGame?.id === game.id ? styles.gameCardActiveSelected : ''}`}
                  onClick={() => setSelectedGame(game)}
                >
                  <span className={styles.gameCatalogTitle}>{game.title}</span>
                </div>
              ))}
              {gamesList.length === 0 && (
                <p className={styles.statusText} style={{ gridColumn: '1 / -1', margin: '20px 0' }}>
                  {t('common:status.loading')}
                </p>
              )}
            </div>

            <div className={styles.actionRowButton}>
              <ActionButton variant="neutral" size="large" onClick={handleNextStep}>
                {t('videoUpload:actions.next')}
              </ActionButton>
            </div>
          </div>
        )}

        {currentStep === 'fillDetails' && (
          <div className={styles.stepWrapper}>
            <span className={styles.stepIndicator}>{t('videoUpload:form.stepDetails')}</span>

            <p className={styles.selectedGameBadge}>
              <strong>Juego:</strong> {selectedGame?.title}
            </p>

            <div className={styles.formTwoColumnsLayout}>

              <div className={styles.formLeftColumn}>
                <div className={styles.inputGroup}>
                  <label className={styles.formLabel}>{t('videoUpload:form.titleLabel')}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={t('videoUpload:form.titlePlaceholder')}
                    value={clipTitle}
                    onChange={(e) => setClipTitle(e.target.value)}
                  />
                  {titleError && <span className={styles.inlineErrorLabel}>{titleError}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.formLabel}>{t('videoUpload:form.descriptionLabel')}</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder={t('videoUpload:form.descriptionPlaceholder')}
                    value={clipDescription}
                    onChange={(e) => setClipDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formRightColumn}>
                <div className={styles.inputGroup}>
                  <label className={styles.formLabel}>{t('videoUpload:form.fileLabel')}</label>
                  <input
                    type="file"
                    accept=".mp4,.mov"
                    className={styles.formFileInput}
                    onChange={handleFileChange}
                  />
                  {fileError && <span className={styles.inlineErrorLabel}>{fileError}</span>}

                  <div className={styles.requirementsBox}>
                    <p>{t('videoUpload:requirements.formats')}</p>
                    <p>{t('videoUpload:requirements.size')}</p>
                    <p>{t('videoUpload:requirements.duration')}</p>
                  </div>
                </div>
              </div>

            </div>

            <div className={styles.actionRowButton}>
              {!gameId && (
                <ActionButton variant="cancel" size="large" onClick={() => setCurrentStep('selectGame')}>
                  {t('videoUpload:actions.back')}
                </ActionButton>
              )}
              <ActionButton variant="save" size="large" onClick={handleNextStepSubmit}>
                {t('videoUpload:actions.submit')}
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
