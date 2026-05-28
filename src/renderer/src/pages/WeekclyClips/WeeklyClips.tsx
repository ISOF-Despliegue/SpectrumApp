import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './WeklyClips.module.css';
import { AnalyticsService } from '../../services/analytics.service';
import { WeeklyReview } from '../../types/analytics.types';
import { Pagination } from '../../components/ui/Pagination';
import { ClipUploadFlowModal } from '../../components/ui/VideoComponents/VideoUploadModal/ClipUploadFlowModal';
import { useToast } from '../../components/ui/Toast';
import { ClipVoteControls } from '../../components/ui/ClipVoteControls';
import { ReviewVoteControls } from '../../components/ui/ReviewVoteControls';

const PAGE_SIZE = 6;

const ClipCard = ({
  clip,
  playing,
  onPlay
}: {
  clip: WeeklyReview;
  playing: string | null;
  onPlay: (reviewId: string) => void;
}): React.JSX.Element => {
  const { t } = useTranslation('weeklyClips');

  return (
    <article className={styles.clipCard}>
      <div className={styles.videoShell}>
        {playing === clip.reviewId ? (
          <video src={clip.attachmentUrl} controls preload="metadata" />
        ) : (
          <button type="button" onClick={() => onPlay(clip.reviewId)}>{t('play')}</button>
        )}
      </div>
      <div className={styles.cardBody}>
        <h2>{clip.title}</h2>
        <p>{clip.gameTitle} - {clip.username}</p>
        {clip.sourceType === 'GAME_CLIP' ? (
          <ClipVoteControls
            clipId={clip.reviewId}
            likes={clip.likesCount}
            dislikes={clip.dislikesCount}
            userVote={clip.userVote ?? null}
            isOwnClip={clip.isOwnContent}
            size="small"
          />
        ) : (
          <ReviewVoteControls
            reviewId={clip.reviewId}
            likes={clip.likesCount}
            dislikes={clip.dislikesCount}
            isOwnReview={clip.isOwnContent}
            size="small"
          />
        )}
      </div>
    </article>
  );
};

export const WeeklyClips = (): React.JSX.Element => {
  const { t } = useTranslation('weeklyClips');
  const toast = useToast();
  const [clips, setClips] = useState<WeeklyReview[]>([]);
  const [topClips, setTopClips] = useState<WeeklyReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadClips = async (nextPage = page): Promise<void> => {
    setIsLoading(true);
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
      toast.error(t('loadError'));
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
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>
        <button type="button" onClick={() => setIsUploadOpen(true)}>{t('upload')}</button>
      </header>

      {isLoading && <p className={styles.loading}>{t('loading')}</p>}
      {!isLoading && clips.length === 0 && <p className={styles.empty}>{t('empty')}</p>}

      <section className={styles.topSection}>
        <h2>{t('topMonth')}</h2>
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
