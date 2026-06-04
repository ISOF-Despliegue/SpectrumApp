import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { DropEventPanel } from '../../components/drops/DropEventPanel';
import { useDropEventPolling } from '../../components/drops/useDropEventPolling';
import { useToast } from '../../components/ui/Toast';
import { DropsService } from '../../services/drops.service';
import { asApiError } from '../../utilities/apiError';
import styles from './DropEventDetail.module.css';

export const DropEventDetail = (): React.JSX.Element => {
  const { t } = useTranslation('home');
  const toast = useToast();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { drop, error, isLoading, refresh } = useDropEventPolling(eventId);
  const [now, setNow] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [winnerConfirmed, setWinnerConfirmed] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setWinnerConfirmed(false);
  }, [eventId]);

  const joinDrop = async (): Promise<void> => {
    if (!eventId) return;

    setIsSubmitting(true);
    try {
      await DropsService.join(eventId);
      toast.success(t('drops.joined'));
      await refresh();
    } catch (err: unknown) {
      const apiError = asApiError(err);
      toast.error(apiError.response?.data?.title || t('drops.joinError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const claimDrop = async (): Promise<void> => {
    if (!eventId) return;

    setIsSubmitting(true);
    try {
      const result = await DropsService.claim(eventId);
      if (result.success) {
        setWinnerConfirmed(true);
        toast.success(t('drops.winnerPersistentMessage'));
      } else {
        toast.info(
          result.winnerUsername
            ? t('drops.singleWinner', { username: result.winnerUsername })
            : t('drops.claimUnavailable')
        );
      }
      await refresh();
    } catch (err: unknown) {
      const apiError = asApiError(err);
      toast.error(apiError.response?.data?.title || t('drops.claimError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <button className={styles.backButton} type="button" onClick={() => navigate('/home')}>
          {t('drops.backToHome')}
        </button>
      </div>

      {isLoading && !drop && <p className={styles.statusText}>{t('drops.loadingDetail')}</p>}
      {error && !drop && <p className={styles.error}>{t('drops.detailLoadError')}</p>}
      {drop && (
        <DropEventPanel
          drop={drop}
          now={now}
          isBusy={isSubmitting}
          winnerConfirmed={winnerConfirmed}
          onJoin={joinDrop}
          onClaim={claimDrop}
        />
      )}
    </div>
  );
};
