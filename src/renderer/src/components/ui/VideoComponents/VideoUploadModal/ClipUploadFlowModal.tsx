import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getGames, Game } from '../../../../services/games.service';
import { validateVideoMetadata } from '../../../../utilities/videoValidation';
import { VideoUploadModal } from './VideoUploadModal';
import { ActionButton } from '../../ActionButton';
import { GameCardMedium } from '../../GameCardMedium/GameCardMedium';
import { Pagination } from '../../Pagination/Pagination';
import styles from './ClipUploadFlowModal.module.css';

/**
 * Interface defining properties for the ClipUploadFlowModal component.
 */
interface ClipUploadFlowModalProps {
  onClose: () => void;
  onRefreshClips: () => void;
  gameId?: string;
  gameTitle?: string;
}

type FlowStep = 'selectGame' | 'fillDetails' | 'uploading';

/**
 * ClipUploadFlowModal orchestrates the step-by-step metadata assembly workflow before clip media transmission.
 * Leverages the centralized getGames service layer to eliminate 401 authorization issues.
 */
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
  const [sortBy, setSortBy] = useState<string>('none');
  const [gamesList, setGamesList] = useState<Game[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const pageSizeConstant = 42;

  const [selectedGame, setSelectedGame] = useState<Game | null>(
    gameId && gameTitle ? { id: gameId, title: gameTitle, imageUrl: '', released: '', spectrumRating: 0 } : null
  );

  const [clipTitle, setClipTitle] = useState<string>('');
  const [clipDescription, setClipDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [gameError, setGameError] = useState<string>('');
  const [titleError, setTitleError] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  useEffect(() => {
    if (gameId) return;

    const delayDebounce = setTimeout(async () => {
      try {
        // Delegate state parameters directly to the centralized data service layer
        const response = await getGames(searchQuery, currentPage, sortBy);
        setGamesList(response.items || []);
        setTotalCount(response.totalCount || 0);
      } catch {
        setGamesList([]);
        setTotalCount(0);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, sortBy, currentPage, gameId]);

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
        gameId={String(selectedGame.id)}
        onSuccess={onRefreshClips}
        onClose={onClose}
        onBackToDetails={() => setCurrentStep('fillDetails')}
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
                  <option value="none">{t('common:filters.options.default')}</option>
                  <option value="name_asc">{t('common:filters.options.nameAsc')}</option>
                  <option value="name_desc">{t('common:filters.options.nameDesc')}</option>
                  <option value="date_new">{t('common:filters.options.dateNew')}</option>
                  <option value="date_old">{t('common:filters.options.dateOld')}</option>
                  <option value="rating_desc">{t('common:filters.options.ratingDesc')}</option>
                </select>
              </div>
            </div>

            {gameError && <span className={styles.inlineErrorLabel} style={{ marginBottom: '10px' }}>{gameError}</span>}

            <div className={styles.gamesCatalogGrid}>
              {gamesList.map((game) => (
                <div
                  key={game.id}
                  className={`${styles.gameCardWrapper} ${selectedGame?.id === game.id ? styles.gameCardActiveSelected : ''}`}
                >
                  <GameCardMedium
                    imageUrl={game.imageUrl}
                    onClick={() => setSelectedGame(game)}
                  />
                  <span className={styles.gameCatalogTitle}>{game.title}</span>
                </div>
              ))}
              {gamesList.length === 0 && (
                <p className={styles.statusText} style={{ gridColumn: '1 / -1', margin: '20px 0' }}>
                  {t('common:status.loading')}
                </p>
              )}
            </div>

            {totalCount > pageSizeConstant && (
              <div className={styles.paginationRow}>
                <Pagination
                  currentPage={currentPage}
                  totalCount={totalCount}
                  pageSize={pageSizeConstant}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}

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
              <strong>{t('videoUpload:form.stepGame')}:</strong> {selectedGame?.title}
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
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#00ffcc', fontWeight: 600 }}>
                      {t('videoUpload:requirements.title')}
                    </h3>
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
