import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthService, ROLES } from '../../services/auth.service';
import { DropEvent } from '../../types/drops.types';
import styles from './DropEventPanel.module.css';
import {
  canClaimDrop,
  canJoinDrop,
  formatDateTime,
  getClaimedCodes,
  getDropStatusMessageKey,
  getDropStatusMessageParams,
  getParticipantCount,
  getRemainingCodes,
  getTotalCodes,
  getTotalSlots,
  getWinnerNames,
  isJoinedToDrop,
  percentage
} from './dropEvent.utils';

interface DropEventPanelProps {
  drop: DropEvent;
  now: number;
  isBusy?: boolean;
  winnerConfirmed?: boolean;
  onJoin: () => void;
  onClaim: () => void;
}

export const DropEventPanel = ({
  drop,
  now,
  isBusy = false,
  winnerConfirmed = false,
  onJoin,
  onClaim
}: DropEventPanelProps): React.JSX.Element => {
  const { t } = useTranslation('home');
  const isAdmin = AuthService.getCurrentUser()?.role === ROLES.ADMIN;
  const participantCount = getParticipantCount(drop);
  const totalSlots = getTotalSlots(drop);
  const claimedCodes = getClaimedCodes(drop);
  const totalCodes = getTotalCodes(drop);
  const winnerNames = getWinnerNames(drop);
  const userWon = Boolean(drop.hasClaimed || winnerConfirmed);
  const statusMessage = t(getDropStatusMessageKey(drop, now), getDropStatusMessageParams(drop));
  const winnerTitle = useMemo(() => {
    if (winnerNames.length !== 1) return t('drops.winnersTitle');
    return t('drops.singleWinner', { username: winnerNames[0] });
  }, [t, winnerNames]);

  return (
    <section className={styles.panel}>
      <div className={styles.hero}>
        {drop.imageUrl ? (
          <img className={styles.heroImage} src={drop.imageUrl} alt="" loading="lazy" />
        ) : (
          <div className={styles.heroImagePlaceholder} aria-hidden="true">
            <span>{drop.gameTitle.slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        <div className={styles.summary}>
          <div className={styles.titleMeta}>
            <span className={styles.statusPill}>{drop.status}</span>
            {isJoinedToDrop(drop) && <span className={styles.joinedPill}>{t('drops.joinedStatus')}</span>}
          </div>
          <h1>{drop.title}</h1>
          <h2>
            {drop.gameTitle} · {drop.platform}
          </h2>
          {drop.description && <p className={styles.description}>{drop.description}</p>}
          <strong className={styles.statusMessage}>{statusMessage}</strong>
          {userWon && <div className={styles.winnerMessage}>{t('drops.winnerPersistentMessage')}</div>}
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span>{t('drops.registration')}</span>
          <strong>
            {formatDateTime(drop.startAt)} - {formatDateTime(drop.closeAt ?? drop.joinDeadlineAt)}
          </strong>
        </div>
        <div className={styles.metaItem}>
          <span>{t('drops.reveal')}</span>
          <strong>{formatDateTime(drop.revealAt)}</strong>
        </div>
        <div className={styles.metaItem}>
          <span>{t('drops.detailsStatus')}</span>
          <strong>{drop.status}</strong>
        </div>
        <div className={styles.metaItem}>
          <span>{t('drops.endAt')}</span>
          <strong>{formatDateTime(drop.endAt)}</strong>
        </div>
      </div>

      <div className={styles.progressGrid}>
        <div className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <strong>{t('drops.participants')}</strong>
            <span>{t('drops.slots', { taken: participantCount, total: totalSlots })}</span>
          </div>
          <div className={styles.progressBar} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${percentage(participantCount, totalSlots)}%` }} />
          </div>
        </div>

        <div className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <strong>{t('drops.rewards')}</strong>
            <span>{t('drops.codes', { claimed: claimedCodes, total: totalCodes })}</span>
          </div>
          <div className={styles.progressBar} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${percentage(claimedCodes, totalCodes)}%` }} />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {canJoinDrop(drop, now, isAdmin) && (
          <button className={styles.primaryButton} type="button" disabled={isBusy} onClick={onJoin}>
            {t('drops.join')}
          </button>
        )}

        {canClaimDrop(drop, now, isAdmin) && (
          <button className={styles.claimButton} type="button" disabled={isBusy} onClick={onClaim}>
            {t('drops.claim')}
          </button>
        )}

        {isJoinedToDrop(drop) && !userWon && <p className={styles.joinedNote}>{t('drops.joinedStatus')}</p>}
        {getRemainingCodes(drop) <= 0 && <p className={styles.quietNote}>{t('drops.state.exhausted')}</p>}
      </div>

      {winnerNames.length > 0 && (
        <div className={styles.winnerPanel}>
          <h3>{winnerTitle}</h3>
          {winnerNames.length > 1 && (
            <div className={styles.winnerList}>
              {winnerNames.map(winner => (
                <span className={styles.winnerChip} key={winner}>
                  {winner}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
