import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { getWinnerNames } from '../../components/drops/dropEvent.utils';
import { HomeService } from '../../services/home.service';
import { GlobalSearchItem, HomeDashboard } from '../../types/home.types';
import { ReviewCardPre } from '../../components/ui/ReviewCards/ReviewCardPre';
import bannerOne from '../../assets/images/Banner1.gif';
import bannerTwo from '../../assets/images/Banner2.png';

const HERO_IMAGES = [bannerOne, bannerTwo];

export const Home = (): React.JSX.Element => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

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
                <button type="button" onClick={() => navigate(`/drops/${drop.eventId}`)}>
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
    </div>
  );
};
