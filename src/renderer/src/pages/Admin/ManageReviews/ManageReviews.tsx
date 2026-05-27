import { useState } from 'react';
import styles from './ManageReviews.module.css';
import { AdminReviewsService } from '../../../services/adminReviews.service';
import { Review } from '../../../types/reviews.types';
import { Pagination } from '../../../components/ui/Pagination';

const PAGE_SIZE = 10;

export const AdminManageReviews = (): React.JSX.Element => {
  const [gameQuery, setGameQuery] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async (nextPage = page): Promise<void> => {
    if (!gameQuery.trim()) {
      setError('Primero busca por juego.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await AdminReviewsService.search({
        gameQuery,
        search: reviewSearch,
        sort,
        page: nextPage,
        pageSize: PAGE_SIZE
      });
      setReviews(result.items);
      setTotalCount(result.totalCount);
      setPage(nextPage);
    } catch {
      setError('No se pudieron cargar las resenas.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (reviewId: string): Promise<void> => {
    if (!window.confirm('Deseas borrar esta resena?')) return;
    setIsLoading(true);
    try {
      await AdminReviewsService.delete(reviewId);
      await loadReviews(page);
    } catch {
      setError('No se pudo borrar la resena.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Administrar resenas</h1>
          <p>Busca primero un juego y modera resenas paginadas.</p>
        </div>
      </header>

      <section className={styles.filters}>
        <input placeholder="Nombre del juego" value={gameQuery} onChange={(event) => setGameQuery(event.target.value)} />
        <input placeholder="Usuario o titulo de resena" value={reviewSearch} onChange={(event) => setReviewSearch(event.target.value)} />
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="date_desc">Fecha descendente</option>
          <option value="date_asc">Fecha ascendente</option>
          <option value="likes">Likes</option>
          <option value="dislikes">Dislikes</option>
          <option value="alpha">Alfabetico</option>
        </select>
        <button onClick={() => loadReviews(1)}>Buscar</button>
      </section>

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>Cargando resenas...</p>}
      {!isLoading && reviews.length === 0 && <p className={styles.empty}>Sin resultados.</p>}

      <section className={styles.reviewList}>
        {reviews.map((review) => (
          <article className={styles.reviewRow} key={review.id}>
            <div>
              <h3>{review.title}</h3>
              <p>{review.content}</p>
              <span>{review.gameTitle || review.gameId} · {review.username} · {new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.scoreBox}>
              <strong>{review.likesCount}</strong>
              <span>likes</span>
              <strong>{review.dislikesCount}</strong>
              <span>dislikes</span>
            </div>
            <button onClick={() => deleteReview(review.id)}>Borrar</button>
          </article>
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
    </div>
  );
};
