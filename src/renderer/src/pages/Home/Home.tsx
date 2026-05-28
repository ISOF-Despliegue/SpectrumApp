import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { DropsService } from '../../services/drops.service';
import { HomeService } from '../../services/home.service';
import { DropEvent } from '../../types/drops.types';
import { GlobalSearchItem, HomeDashboard } from '../../types/home.types';
import { useToast } from '../../components/ui/Toast';
import bannerOne from '../../assets/images/Banner1.gif';
import bannerTwo from '../../assets/images/Banner2.png';

const HERO_IMAGES = [bannerOne, bannerTwo];

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

  const loadDashboard = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      setDashboard(await HomeService.getDashboard());
    } catch {
      setError(t('states.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

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
    const startsInMs = new Date(selectedDrop.startAt).getTime() - Date.now();
    if (startsInMs <= 0) return t('drops.aboutToStart');
    const minutes = Math.ceil(startsInMs / 60000);
    return t('drops.startsIn', { minutes });
  }, [selectedDrop, t]);

  const changeBanner = (direction: number): void => {
    setBannerIndex((current) => (current + direction + HERO_IMAGES.length) % HERO_IMAGES.length);
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
      setSelectedDrop(drop);
      setMessage(t('drops.joined'));
      toast.success(t('drops.joined'));
      await loadDashboard();
    } catch (err: any) {
      const friendlyMessage = err.response?.data?.title || t('drops.joinError');
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
      await loadDashboard();
    } catch (err: any) {
      const friendlyMessage = err.response?.data?.title || t('drops.claimError');
      toast.error(friendlyMessage);
      setError(friendlyMessage);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.topTools}>
        <div className={styles.searchBox}>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
          />
          {(searchResults.length > 0 || isSearching) && (
            <div className={styles.searchResults}>
              {isSearching && <p>{t('search.loading')}</p>}
              {!isSearching && searchResults.map((item) => (
                <button key={`${item.type}-${item.id}`} type="button" onClick={() => openSearchResult(item)}>
                  {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" />}
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.type === 'game' ? t('search.game') : t('search.user')} {item.subtitle ? `- ${item.subtitle}` : ''}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <header className={styles.banner}>
        <img src={HERO_IMAGES[bannerIndex]} alt="" className={styles.bannerImage} />
        <div className={styles.bannerContent}>
          <h1>{dashboard?.bannerTitle || t('banner.fallbackTitle')}</h1>
          <p>{dashboard?.bannerSubtitle || t('banner.fallbackSubtitle')}</p>
        </div>
        <div className={styles.bannerControls}>
          <button type="button" onClick={() => changeBanner(-1)} aria-label={t('banner.previous')}>‹</button>
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
          <button type="button" onClick={() => changeBanner(1)} aria-label={t('banner.next')}>›</button>
        </div>
      </header>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>{t('states.loading')}</p>}

      <main className={styles.columns}>
        <section className={styles.panel}>
          <h2>{t('sections.recentGames')}</h2>
          <div className={styles.gameGrid}>
            {(dashboard?.recentGames || []).map((game) => (
              <button key={game.gameId} type="button" className={styles.gameCard} onClick={() => navigate(`/games/${game.gameId}/reviews`)}>
                {game.coverImageUrl && <img src={game.coverImageUrl} alt="" loading="lazy" />}
                <span>{game.title}</span>
              </button>
            ))}
          </div>
          {!isLoading && dashboard?.recentGames.length === 0 && <p className={styles.empty}>{t('empty.recentGames')}</p>}
        </section>

        <section className={`${styles.panel} ${styles.centerPanel}`}>
          <h2>{t('sections.popularReviews')}</h2>
          <div className={styles.reviewList}>
            {(dashboard?.popularReviewsToday || []).map((review) => (
              <button key={review.reviewId} type="button" className={styles.reviewCard} onClick={() => navigate(`/games/${review.gameId}/reviews`)}>
                {review.gameCoverUrl && <img src={review.gameCoverUrl} alt="" loading="lazy" />}
                <span>
                  <strong>{review.title}</strong>
                  <small>{review.username} - {review.gameTitle}</small>
                  <em>{t('reviews.likes', { count: review.likesCount })} - {t('reviews.comments', { count: review.commentsCount })}</em>
                </span>
              </button>
            ))}
          </div>
          {!isLoading && dashboard?.popularReviewsToday.length === 0 && <p className={styles.empty}>{t('empty.popularReviews')}</p>}
        </section>

        <section className={styles.panel}>
          <h2>{t('sections.weeklyDrop')}</h2>
          <div className={styles.dropList}>
            {(dashboard?.weeklyDrops || []).map((drop) => (
              <article className={styles.dropCard} key={drop.eventId}>
                {drop.imageUrl && <img src={drop.imageUrl} alt="" loading="lazy" />}
                <strong>{drop.title}</strong>
                <span>{drop.gameTitle} - {drop.platform}</span>
                <small>{new Date(drop.startAt).toLocaleDateString()} - {drop.status}</small>
                {drop.winnerUsername ? (
                  <p>{t('drops.winner', { username: drop.winnerUsername })}</p>
                ) : drop.status === 'ACTIVE_JOIN' ? (
                  <button type="button" onClick={() => joinDrop(drop)}>{t('drops.join')}</button>
                ) : (
                  <button type="button" onClick={() => setSelectedDrop(drop)}>{t('drops.details')}</button>
                )}
              </article>
            ))}
          </div>
          {!isLoading && dashboard?.weeklyDrops.length === 0 && <p className={styles.empty}>{t('empty.weeklyDrops')}</p>}
        </section>
      </main>

      {selectedDrop && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setSelectedDrop(null)}>
          <section className={styles.dropModal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.closeButton} type="button" onClick={() => setSelectedDrop(null)} aria-label={t('drops.close')}>x</button>
            <h2>{t('drops.modalTitle')}</h2>
            {selectedDrop.imageUrl && <img src={selectedDrop.imageUrl} alt="" />}
            <h3>{selectedDrop.gameTitle}</h3>
            <p>{new Date(selectedDrop.startAt).toLocaleString()} - {new Date(selectedDrop.endAt).toLocaleString()}</p>
            <strong>{countdownText}</strong>

            {selectedDrop.status === 'REVEAL_ACTIVE' ? (
              <div className={styles.claimBox}>
                <p>{t('drops.revealActive')}</p>
                <button type="button" onClick={claimDrop}>{t('drops.claim')}</button>
              </div>
            ) : (
              <p>{t('drops.claimSoon')}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
