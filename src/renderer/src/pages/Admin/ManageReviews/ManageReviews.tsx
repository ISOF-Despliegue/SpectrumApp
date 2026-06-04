import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ManageReviews.module.css';
import { AdminReviewsService } from '../../../services/adminReviews.service';
import { Game, getGames } from '../../../services/games.service';
import { Review } from '../../../types/reviews.types';
import { Pagination } from '../../../components/ui/Pagination';
import { ReviewCardPre } from '../../../components/ui/ReviewCards/ReviewCardPre';
import { ReviewDetailModal } from '../../../components/ui/ReviewDetailModal';
import { useToast } from '../../../components/ui/Toast';
import { FIELD_LIMITS } from '../../../utilities/validationRules';

const PAGE_SIZE = 10;

export const AdminManageReviews = (): React.JSX.Element => {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [gameQuery, setGameQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameSuggestions, setGameSuggestions] = useState<Game[]>([]);
  const [isSearchingGames, setIsSearchingGames] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    const query = gameQuery.trim();
    if (query.length < 2 || selectedGame?.title === query) {
      setGameSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearchingGames(true);
      try {
        const response = await getGames(query, 1, 'name_asc');
        setGameSuggestions(response.items.slice(0, 6));
      } catch {
        setGameSuggestions([]);
      } finally {
        setIsSearchingGames(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [gameQuery, selectedGame?.title]);

  const selectGame = (game: Game): void => {
    setSelectedGame(game);
    setGameQuery(game.title);
    setGameSuggestions([]);
    setPage(1);
  };

  const loadReviews = async (nextPage = page): Promise<void> => {
    if (!selectedGame) {
      toast.warning(t('manageReviews.selectGameFirst'));
      return;
    }
    setIsLoading(true);
    try {
      const result = await AdminReviewsService.search({
        gameId: Number(selectedGame.id),
        search: reviewSearch,
        sort,
        page: nextPage,
        pageSize: PAGE_SIZE
      });
      setReviews(result.items);
      setTotalCount(result.totalCount);
      setPage(nextPage);
    } catch {
      toast.error(t('manageReviews.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (reviewId: string): Promise<void> => {
    if (deleteReason.trim().length < 10) {
      toast.warning(t('manageReviews.deleteReasonRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await AdminReviewsService.delete(reviewId, deleteReason.trim());
      setReviewToDelete(null);
      setDeleteReason('');
      toast.success(t('manageReviews.deleted'));
      await loadReviews(page);
    } catch {
      toast.error(t('manageReviews.deleteError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t('manageReviews.title')}</h1>
          <p>{t('manageReviews.subtitle')}</p>
        </div>
      </header>

      <section className={styles.filters}>
        <div className={styles.autocomplete}>
          <input
            placeholder={t('manageReviews.gamePlaceholder')}
            value={gameQuery}
            maxLength={FIELD_LIMITS.shortText}
            onChange={(event) => {
              setGameQuery(event.target.value);
              setSelectedGame(null);
            }}
          />
          {(gameSuggestions.length > 0 || isSearchingGames) && (
            <div className={styles.suggestions}>
              {isSearchingGames && <span>{t('manageReviews.searching')}</span>}
              {gameSuggestions.map((game) => (
                <button key={game.id} type="button" onClick={() => selectGame(game)}>
                  {game.imageUrl && <img src={game.imageUrl} alt="" loading="lazy" />}
                  <span>{game.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <input placeholder={t('manageReviews.reviewPlaceholder')} maxLength={FIELD_LIMITS.shortText} value={reviewSearch} onChange={(event) => setReviewSearch(event.target.value)} />
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="date_desc">{t('manageReviews.sort.dateDesc')}</option>
          <option value="date_asc">{t('manageReviews.sort.dateAsc')}</option>
          <option value="likes">{t('manageReviews.sort.likes')}</option>
          <option value="dislikes">{t('manageReviews.sort.dislikes')}</option>
          <option value="alpha">{t('manageReviews.sort.alpha')}</option>
        </select>
        <button type="button" onClick={() => loadReviews(1)}>{t('manageReviews.search')}</button>
      </section>

      {isLoading && <p className={styles.loading}>{t('manageReviews.loading')}</p>}
      {!isLoading && reviews.length === 0 && <p className={styles.empty}>{t('manageReviews.empty')}</p>}

      <section className={styles.reviewList}>
        {reviews.map((review) => (
          <div className={styles.reviewItem} key={review.id}>
            <ReviewCardPre
              reviewId={review.id}
              gameCover={review.gameCoverUrl}
              username={review.username}
              userImage={review.userProfileImageUrl || review.profilePicture}
              reviewTitle={review.title}
              reviewContent={review.content}
              reviewDate={new Date(review.createdAt).toLocaleDateString()}
              reviewImage={review.attachmentType === 'image' ? review.attachmentUrl || review.imageUrl : undefined}
              likes={review.likesCount}
              score={review.rating}
              dislikes={review.dislikesCount}
              isOwnReview={review.isOwnReview}
              userVote={review.userVote ?? review.currentUserVote ?? review.myVote ?? null}
              onClick={() => setSelectedReview(review)}
            />
            <button
              type="button"
              onClick={() => {
                setReviewToDelete(review.id);
                setDeleteReason('');
              }}
            >
              {t('manageReviews.delete')}
            </button>
          </div>
        ))}
      </section>

      {totalCount > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          onPageChange={(nextPage) => loadReviews(nextPage)}
        />
      )}

      <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />

      {reviewToDelete && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setReviewToDelete(null)}>
          <section className={styles.deleteDialog} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <h2>{t('manageReviews.deleteTitle')}</h2>
            <p>{t('manageReviews.deleteMessage')}</p>
            <label>
              <span>{t('manageReviews.deleteReasonLabel')}</span>
              <textarea
                value={deleteReason}
                maxLength={FIELD_LIMITS.mediumText}
                minLength={10}
                rows={4}
                onChange={(event) => setDeleteReason(event.target.value)}
                placeholder={t('manageReviews.deleteReasonPlaceholder')}
              />
            </label>
            <div className={styles.dialogActions}>
              <button type="button" onClick={() => setReviewToDelete(null)}>{t('adminProfile.cancel')}</button>
              <button type="button" disabled={deleteReason.trim().length < 10} onClick={() => deleteReview(reviewToDelete)}>
                {t('manageReviews.delete')}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
