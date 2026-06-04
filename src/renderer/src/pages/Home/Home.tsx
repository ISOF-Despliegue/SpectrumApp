import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { DropsService } from '../../services/drops.service';
import { HomeService } from '../../services/home.service';
import { DropEvent } from '../../types/drops.types';
import { GlobalSearchItem, HomeDashboard } from '../../types/home.types';
import { useToast } from '../../components/ui/Toast';
import { ReviewCardPre } from '../../components/ui/ReviewCards/ReviewCardPre';
import { asApiError } from '../../utilities/apiError';
import bannerOne from '../../assets/images/Banner1.gif';
import bannerTwo from '../../assets/images/Banner2.png';

const HERO_IMAGES = [bannerOne, bannerTwo];
const JOIN_OPEN_STATUSES = new Set(['REGISTRATION_OPEN', 'ACTIVE_JOIN']);
const REVEAL_STATUSES = new Set(['REVEAL_READY', 'REVEAL_ACTIVE']);
const FINISHED_DROP_STATUSES = new Set(['EXHAUSTED', 'FINISHED', 'EXPIRED', 'ARCHIVED']);

const isJoinedToDrop = (drop: DropEvent): boolean => Boolean(drop.currentUserJoined ?? drop.isJoined);
const getRemainingSlots = (drop: DropEvent): number => Math.max(0, drop.remainingSlots ?? drop.availableSlots ?? 0);
const getRemainingCodes = (drop: DropEvent): number =>
  Math.max(0, drop.rewardCodesAvailable ?? drop.keysAvailable ?? 0);
const getTotalCodes = (drop: DropEvent): number => Math.max(0, drop.rewardCodesTotal ?? drop.keysTotal ?? 0);
const getClaimedCodes = (drop: DropEvent): number =>
  Math.max(0, drop.claimedRewardCount ?? getTotalCodes(drop) - getRemainingCodes(drop));
const getWinnerNames = (drop: DropEvent): string[] => {
  const winners = drop.winners?.map(winner => winner.username).filter(Boolean) ?? [];
  return winners.length > 0 ? winners : drop.winnerUsername ? [drop.winnerUsername] : [];
};

const formatDuration = (milliseconds: number): string => {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatClock = (value: string): string =>
  new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const Home = (): React.JSX.Element => {
  const { t } = useTranslation('home');
  const toast = useToast();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [selectedDrop, setSelectedDrop] = useState<DropEvent | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const selectedDropId = selectedDrop?.eventId;

  const loadDashboard = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      setDashboard(await HomeService.getDashboard());
    } catch {
      setError(t('states.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const refreshSelectedDrop = useCallback(
    async (eventId: string): Promise<DropEvent | null> => {
      try {
        const updatedDrop = await DropsService.getPublic(eventId);
        setSelectedDrop(updatedDrop);
        return updatedDrop;
      } catch {
        await loadDashboard();
        return null;
      }
    },
    [loadDashboard]
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBannerIndex(current => (current + 1) % HERO_IMAGES.length);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!selectedDropId) return;

    const intervalId = window.setInterval(() => {
      void refreshSelectedDrop(selectedDropId);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [refreshSelectedDrop, selectedDropId]);

  useEffect(() => {
    const normalized = searchText.trim();
    if (normalized.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await HomeService.searchGlobal(normalized);
        setSearchResults([...result.games, ...result.users]);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  const countdownText = useMemo(() => {
    if (!selectedDrop) return '';
    const startAt = new Date(selectedDrop.startAt).getTime();
    const closeAt = new Date(selectedDrop.closeAt ?? selectedDrop.joinDeadlineAt).getTime();
    const revealAt = new Date(selectedDrop.revealAt).getTime();
    const endAt = new Date(selectedDrop.endAt).getTime();
    if (now < startAt) return t('drops.startsIn', { time: formatDuration(startAt - now) });
    if (now <= closeAt)
      return t('drops.registrationClosesAt', {
        time: formatClock(selectedDrop.closeAt ?? selectedDrop.joinDeadlineAt)
      });
    if (now < revealAt) return t('drops.waitingReveal');
    if (now <= endAt && getRemainingCodes(selectedDrop) > 0) return t('drops.revealActive');
    if (getRemainingCodes(selectedDrop) <= 0) return t('drops.rewardsClaimed');
    return t('drops.finished');
  }, [now, selectedDrop, t]);

  const changeBanner = (direction: number): void => {
    setBannerIndex(current => (current + direction + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  const openSearchResult = (item: GlobalSearchItem): void => {
    setSearchText('');
    setSearchResults([]);
    if (item.type === 'game') {
      navigate(`/games/${item.id}/reviews`);
      return;
    }
    navigate(`/users/${item.id}`);
  };

  const joinDrop = async (drop: DropEvent): Promise<void> => {
    setMessage(null);
    setError(null);
    try {
      await DropsService.join(drop.eventId);
      await refreshSelectedDrop(drop.eventId);
      setMessage(t('drops.joined'));
      toast.success(t('drops.joined'));
      await loadDashboard();
    } catch (err: unknown) {
      const apiError = asApiError(err);
      const friendlyMessage = apiError.response?.data?.title || t('drops.joinError');
      toast.error(friendlyMessage);
      setError(friendlyMessage);
    }
  };

  const claimDrop = async (): Promise<void> => {
    if (!selectedDrop) return;
    setMessage(null);
    setError(null);
    try {
      const result = await DropsService.claim(selectedDrop.eventId);
      if (result.success) {
        setMessage(t('drops.winnerMessage'));
        toast.success(t('drops.winnerMessage'));
      } else if (result.winnerUsername) {
        setMessage(t('drops.finishedWithWinner', { username: result.winnerUsername }));
      } else {
        setMessage(t('drops.claimUnavailable'));
      }
      await refreshSelectedDrop(selectedDrop.eventId);
      await loadDashboard();
    } catch (err: unknown) {
      const apiError = asApiError(err);
      const friendlyMessage = apiError.response?.data?.title || t('drops.claimError');
      toast.error(friendlyMessage);
      setError(friendlyMessage);
    }
  };

  const canClaimSelectedDrop = (drop: DropEvent): boolean => {
    const revealAt = new Date(drop.revealAt).getTime();
    const endAt = new Date(drop.endAt).getTime();
    const claimWindowOpen = now >= revealAt && now <= endAt;
    return Boolean(
      drop.canClaim ??
      (isJoinedToDrop(drop) &&
        !drop.hasClaimed &&
        claimWindowOpen &&
        getRemainingCodes(drop) > 0 &&
        (REVEAL_STATUSES.has(drop.status) || FINISHED_DROP_STATUSES.has(drop.status)))
    );
  };

  const shouldShowFinished = (drop: DropEvent): boolean => {
    const revealAt = new Date(drop.revealAt).getTime();
    const endAt = new Date(drop.endAt).getTime();
    const insideClaimWindow = now >= revealAt && now <= endAt;
    return FINISHED_DROP_STATUSES.has(drop.status) && (!insideClaimWindow || getRemainingCodes(drop) <= 0);
  };

  return (
    <div className={styles.page}>
      <section className={styles.topTools}>
        <div className={styles.searchBox}>
          <input
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
          />
          {(searchResults.length > 0 || isSearching) && (
            <div className={styles.searchResults}>
              {isSearching && <p>{t('search.loading')}</p>}
              {!isSearching &&
                searchResults.map(item => (
                  <button key={`${item.type}-${item.id}`} type="button" onClick={() => openSearchResult(item)}>
                    {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" />}
                    <span>
                      <strong>{item.title}</strong>
                      <small>
                        {item.type === 'game' ? t('search.game') : t('search.user')}{' '}
                        {item.subtitle ? `- ${item.subtitle}` : ''}
                      </small>
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </section>

      <header className={styles.banner}>
        <img src={HERO_IMAGES[bannerIndex]} alt="" className={styles.bannerImage} />
        <div className={styles.bannerControls}>
          <button type="button" onClick={() => changeBanner(-1)} aria-label={t('banner.previous')}>
            {'<'}
          </button>
          <div className={styles.bannerDots}>
            {HERO_IMAGES.map((_, index) => (
              <button
                key={index}
                type="button"
                className={index === bannerIndex ? styles.activeDot : ''}
                onClick={() => setBannerIndex(index)}
                aria-label={t('banner.goTo', { index: index + 1 })}
              />
            ))}
          </div>
          <button type="button" onClick={() => changeBanner(1)} aria-label={t('banner.next')}>
            {'>'}
          </button>
        </div>
      </header>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>{t('states.loading')}</p>}

      <main className={styles.columns}>
        <section className={styles.panel}>
          <h2>{t('sections.recentGames')}</h2>
          <div className={styles.gameGrid}>
            {(dashboard?.recentGames || []).map(game => (
              <button
                key={game.gameId}
                type="button"
                className={styles.gameCard}
                onClick={() => navigate(`/games/${game.gameId}/reviews`)}>
                {game.coverImageUrl && <img src={game.coverImageUrl} alt="" loading="lazy" />}
                <span>{game.title}</span>
              </button>
            ))}
          </div>
          {!isLoading && dashboard?.recentGames.length === 0 && (
            <p className={styles.empty}>{t('empty.recentGames')}</p>
          )}
        </section>

        <section className={`${styles.panel} ${styles.centerPanel}`}>
          <h2>{t('sections.popularReviews')}</h2>
          <div className={styles.reviewList}>
            {(dashboard?.popularReviewsToday || []).map(review => (
              <ReviewCardPre
                key={review.reviewId}
                reviewId={review.reviewId}
                gameCover={review.gameCoverUrl}
                username={review.username}
                reviewTitle={review.title}
                reviewContent={review.content}
                reviewDate={new Date(review.createdAt).toLocaleDateString()}
                likes={review.likesCount}
                dislikes={review.dislikesCount}
                score={review.rating}
                isOwnReview={Boolean(review.isOwnReview)}
                canVote={review.canVote}
                userVote={review.userVote ?? review.currentUserVote ?? review.myVote ?? null}
                context="home"
                onClick={() => navigate(`/games/${review.gameId}/reviews`)}
              />
            ))}
          </div>
          {!isLoading && dashboard?.popularReviewsToday.length === 0 && (
            <p className={styles.empty}>{t('empty.popularReviews')}</p>
          )}
        </section>

        <section className={styles.panel}>
          <h2>{t('sections.weeklyDrop')}</h2>
          <div className={styles.dropList}>
            {(dashboard?.weeklyDrops || []).map(drop => (
              <article className={styles.dropCard} key={drop.eventId}>
                {drop.imageUrl && <img src={drop.imageUrl} alt="" loading="lazy" />}
                <strong>{drop.title}</strong>
                <span>
                  {drop.gameTitle} - {drop.platform}
                </span>
                <small>
                  {new Date(drop.startAt).toLocaleDateString()} - {drop.status}
                </small>
                <small>
                  {t('drops.slots', {
                    taken: drop.participantCount ?? drop.participantsCount,
                    total: drop.maxParticipants ?? drop.totalSlots
                  })}
                </small>
                {getWinnerNames(drop).length > 0 && (
                  <p>{t('drops.winners', { winners: getWinnerNames(drop).join(', ') })}</p>
                )}
                <button type="button" onClick={() => setSelectedDrop(drop)}>
                  {t('drops.details')}
                </button>
              </article>
            ))}
          </div>
          {!isLoading && dashboard?.weeklyDrops.length === 0 && (
            <p className={styles.empty}>{t('empty.weeklyDrops')}</p>
          )}
        </section>
      </main>

      {selectedDrop && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setSelectedDrop(null)}>
          <section
            className={styles.dropModal}
            role="dialog"
            aria-modal="true"
            onMouseDown={event => event.stopPropagation()}>
            <button
              className={styles.closeButton}
              type="button"
              onClick={() => setSelectedDrop(null)}
              aria-label={t('drops.close')}>
              x
            </button>
            <h2>{t('drops.modalTitle')}</h2>
            {selectedDrop.imageUrl && <img src={selectedDrop.imageUrl} alt="" />}
            <h3>{selectedDrop.gameTitle}</h3>
            <p>{selectedDrop.title}</p>
            <div className={styles.dropMeta}>
              <span>
                {t('drops.registration')}: {new Date(selectedDrop.startAt).toLocaleString()} -{' '}
                {new Date(selectedDrop.closeAt ?? selectedDrop.joinDeadlineAt).toLocaleString()}
              </span>
              <span>
                {t('drops.reveal')}: {new Date(selectedDrop.revealAt).toLocaleString()}
              </span>
              <span>
                {t('drops.slots', {
                  taken: selectedDrop.participantCount ?? selectedDrop.participantsCount,
                  total: selectedDrop.maxParticipants ?? selectedDrop.totalSlots
                })}
              </span>
              <span>
                {t('drops.codes', { claimed: getClaimedCodes(selectedDrop), total: getTotalCodes(selectedDrop) })}
              </span>
            </div>
            <strong className={styles.statusNote}>{countdownText}</strong>

            {selectedDrop.hasClaimed && <p className={styles.success}>{t('drops.winnerMessage')}</p>}
            {isJoinedToDrop(selectedDrop) && !selectedDrop.hasClaimed && (
              <p className={styles.success}>{t('drops.joinedStatus')}</p>
            )}
            {!isJoinedToDrop(selectedDrop) &&
              (selectedDrop.canJoin ??
                (JOIN_OPEN_STATUSES.has(selectedDrop.status) && getRemainingSlots(selectedDrop) > 0)) && (
                <button className={styles.joinButton} type="button" onClick={() => joinDrop(selectedDrop)}>
                  {t('drops.join')}
                </button>
              )}
            {!isJoinedToDrop(selectedDrop) && selectedDrop.status === 'FULL' && <p>{t('drops.full')}</p>}
            {selectedDrop.status === 'REGISTRATION_CLOSED' && <p>{t('drops.waitingReveal')}</p>}

            {canClaimSelectedDrop(selectedDrop) ? (
              <div className={styles.claimBox}>
                <p>{t('drops.revealActive')}</p>
                <button className={styles.claimButton} type="button" onClick={claimDrop}>
                  {t('drops.claim')}
                </button>
              </div>
            ) : (
              !shouldShowFinished(selectedDrop) &&
              !selectedDrop.hasClaimed && (
                <p>{getRemainingCodes(selectedDrop) <= 0 ? t('drops.rewardsClaimed') : t('drops.claimSoon')}</p>
              )
            )}

            {getWinnerNames(selectedDrop).length > 0 && (
              <div className={styles.winnerList}>
                <strong>{t('drops.winnersTitle')}</strong>
                {getWinnerNames(selectedDrop).map(winner => (
                  <span key={winner}>{t('drops.winnerUser', { username: winner })}</span>
                ))}
              </div>
            )}
            {shouldShowFinished(selectedDrop) && getWinnerNames(selectedDrop).length === 0 && (
              <p>{t('drops.finished')}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
