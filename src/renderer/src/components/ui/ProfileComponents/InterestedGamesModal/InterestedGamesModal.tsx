import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './InterestedGamesModal.module.css';
import { ProfileGame } from '../../../../services/profile.service';
import { InterestedGameCard } from '../InterestedGameCard/InterestedGameCard';
import { ActionButton } from '../../../../components/ui/ActionButton';

interface InterestedGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: ProfileGame[];
  onDelete: (id: string) => void;
  onOpenSelector: () => void;
}

/// <summary>
/// Modal component that displays the user's current list of interested games.
/// It utilizes the 'profile' translation namespace for all UI labels.
/// </summary>
export const InterestedGamesModal: React.FC<InterestedGamesModalProps> = ({
  isOpen,
  onClose,
  games,
  onDelete,
  onOpenSelector
}) => {
  const { t } = useTranslation('profile');

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <header className={styles.header}>
          <h2>{t('selector.manageTitle')}</h2>
          <button className={styles.btnClose} onClick={onClose} title={t('actions.close')}>
            &times;
          </button>
        </header>

        <section className={styles.body}>
          <div className={styles.gamesGrid}>
            {games.length > 0 ? (
              games.map((game) => (
                <InterestedGameCard
                  key={game.id}
                  id={game.id}
                  title={game.name}
                  imageUrl={game.imageUrl}
                  isEditable={true}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>{t('placeholders.emptyGames')}</p>
              </div>
            )}
          </div>
        </section>

        <footer className={styles.footer}>
          <ActionButton variant="save" onClick={onOpenSelector}>
            + {t('selector.add')}
          </ActionButton>

          <ActionButton variant="neutral" onClick={onClose}>
            {t('actions.close')}
          </ActionButton>
        </footer>
      </div>
    </div>
  );
};
