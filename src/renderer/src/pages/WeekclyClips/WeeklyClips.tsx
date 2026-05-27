import { useEffect, useState } from 'react';
import styles from './WeklyClips.module.css';
import { AnalyticsService } from '../../services/analytics.service';
import { WeeklyReview } from '../../types/analytics.types';
import { Pagination } from '../../components/ui/Pagination';

const PAGE_SIZE = 6;

export const WeeklyClips = (): React.JSX.Element => {
  const [clips, setClips] = useState<WeeklyReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClips = async (nextPage = page): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AnalyticsService.getWeeklyClips(nextPage, PAGE_SIZE);
      setClips(result.items);
      setTotalCount(result.totalCount);
      setPage(nextPage);
    } catch {
      setError('No se pudieron cargar los clips semanales.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClips(1);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Clips semanales</h1>
        <p>Resenas con video mas likeadas durante la semana actual.</p>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>Cargando clips...</p>}
      {!isLoading && clips.length === 0 && <p className={styles.empty}>No hay clips destacados esta semana.</p>}

      <section className={styles.grid}>
        {clips.map((clip) => (
          <article className={styles.clipCard} key={clip.reviewId}>
            <div className={styles.videoShell}>
              {playing === clip.reviewId ? (
                <video src={clip.attachmentUrl} controls preload="metadata" />
              ) : (
                <button onClick={() => setPlaying(clip.reviewId)}>Reproducir clip</button>
              )}
            </div>
            <div className={styles.cardBody}>
              <h2>{clip.title}</h2>
              <p>{clip.gameTitle} · {clip.username}</p>
              <span>{clip.likesCount} likes</span>
            </div>
          </article>
        ))}
      </section>

      {totalCount > PAGE_SIZE && (
        <Pagination currentPage={page} totalCount={totalCount} pageSize={PAGE_SIZE} onPageChange={loadClips} />
      )}
    </div>
  );
};
