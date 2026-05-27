import { useEffect, useState } from 'react';
import styles from './WeklyClips.module.css';
import { AnalyticsService } from '../../services/analytics.service';
import { WeeklyReview } from '../../types/analytics.types';
import { Pagination } from '../../components/ui/Pagination';
import { ClipUploadFlowModal } from '../../components/ui/VideoComponents/VideoUploadModal/ClipUploadFlowModal';

const PAGE_SIZE = 6;

const ClipCard = ({
  clip,
  playing,
  onPlay
}: {
  clip: WeeklyReview;
  playing: string | null;
  onPlay: (reviewId: string) => void;
}): React.JSX.Element => (
  <article className={styles.clipCard}>
    <div className={styles.videoShell}>
      {playing === clip.reviewId ? (
        <video src={clip.attachmentUrl} controls preload="metadata" />
      ) : (
        <button onClick={() => onPlay(clip.reviewId)}>Reproducir clip</button>
      )}
    </div>
    <div className={styles.cardBody}>
      <h2>{clip.title}</h2>
      <p>{clip.gameTitle} - {clip.username}</p>
      <span>{clip.likesCount} likes</span>
    </div>
  </article>
);

export const WeeklyClips = (): React.JSX.Element => {
  const [clips, setClips] = useState<WeeklyReview[]>([]);
  const [topClips, setTopClips] = useState<WeeklyReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClips = async (nextPage = page): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [result, monthlyTop] = await Promise.all([
        AnalyticsService.getWeeklyClips(nextPage, PAGE_SIZE),
        AnalyticsService.getMonthlyTopClips()
      ]);
      setClips(result.items);
      setTopClips(monthlyTop);
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
        <div>
          <h1>Clips semanales</h1>
          <p>Resenas con video mas likeadas durante la semana actual.</p>
        </div>
        <button type="button" onClick={() => setIsUploadOpen(true)}>Subir clip</button>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>Cargando clips...</p>}
      {!isLoading && clips.length === 0 && <p className={styles.empty}>No hay clips destacados esta semana.</p>}

      <section className={styles.topSection}>
        <h2>Top 3 del mes</h2>
        <div className={styles.grid}>
          {topClips.map((clip) => (
            <ClipCard key={`top-${clip.reviewId}`} clip={clip} playing={playing} onPlay={setPlaying} />
          ))}
        </div>
      </section>

      <section className={styles.grid}>
        {clips.map((clip) => (
          <ClipCard key={clip.reviewId} clip={clip} playing={playing} onPlay={setPlaying} />
        ))}
      </section>

      {totalCount > PAGE_SIZE && (
        <Pagination currentPage={page} totalCount={totalCount} pageSize={PAGE_SIZE} onPageChange={loadClips} />
      )}

      {isUploadOpen && (
        <ClipUploadFlowModal
          onClose={() => setIsUploadOpen(false)}
          onRefreshClips={() => {
            setIsUploadOpen(false);
            loadClips(1);
          }}
        />
      )}
    </div>
  );
};
