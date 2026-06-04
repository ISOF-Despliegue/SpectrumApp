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

const getClipKey = (item: WeeklyReview): string =>
  `${item.sourceType || 'CLIP'}-${item.reviewId || item.attachmentUrl}`;

const dedupeClips = (items: WeeklyReview[]): WeeklyReview[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getClipKey(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const getTopWeeklyClips = (items: WeeklyReview[]): WeeklyReview[] =>
  [...dedupeClips(items)]
    .sort((first, second) =>
      (second.likesCount - second.dislikesCount) - (first.likesCount - first.dislikesCount) ||
      second.likesCount - first.likesCount
    )
    .slice(0, 3);

const withoutClips = (items: WeeklyReview[], excluded: WeeklyReview[]): WeeklyReview[] => {
  const excludedKeys = new Set(excluded.map(getClipKey));
  return dedupeClips(items).filter((item) => !excludedKeys.has(getClipKey(item)));
};

const ClipCard = ({
  clip,
  playing,
  onPlay,
  rank,
  featured = false
}: {
  clip: WeeklyReview;
  playing: string | null;
  onPlay: (reviewId: string) => void;
  rank?: number;
  featured?: boolean;
}): React.JSX.Element => {
  const { t } = useTranslation('weeklyClips');
  const vote = clip.userVote ?? clip.currentUserVote ?? clip.myVote ?? null;

  return (
    <article className={`${styles.clipCard} ${featured ? styles.featuredClip : ''} ${rank ? styles[`rank${rank}`] : ''}`}>
      {rank && <span className={styles.rankBadge}>#{rank}</span>}
      <div className={styles.videoShell}>
        {playing === clip.reviewId ? (
          <video src={clip.attachmentUrl} controls preload="metadata" />
        ) : (
          <button type="button" onClick={() => onPlay(clip.reviewId)}>{t('play')}</button>
        )}
      </div>
      <div className={styles.cardBody}>
        <h2>{clip.title}</h2>
        <p className={styles.clipMeta}>{clip.gameTitle} - {clip.username}</p>
        {clip.content && <p className={styles.clipDescription}>{clip.content}</p>}
        {clip.sourceType === 'GAME_CLIP' ? (
          <ClipVoteControls
            clipId={clip.reviewId}
            likes={clip.likesCount}
            dislikes={clip.dislikesCount}
            userVote={vote}
            isOwnClip={clip.isOwnContent}
            size={featured ? 'medium' : 'small'}
          />
        ) : (
          <ReviewVoteControls
            reviewId={clip.reviewId}
            likes={clip.likesCount}
            dislikes={clip.dislikesCount}
            isOwnReview={clip.isOwnContent}
            userVote={vote}
            currentUserVote={clip.currentUserVote}
            myVote={clip.myVote}
            size={featured ? 'medium' : 'small'}
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
      const [result, topSource] = await Promise.all([
        AnalyticsService.getWeeklyClips(nextPage, PAGE_SIZE),
        AnalyticsService.getWeeklyClips(1, PAGE_SIZE)
      ]);
      const resolvedTopClips = getTopWeeklyClips(topSource.items);
      setTopClips(resolvedTopClips);
      setClips(withoutClips(result.items, nextPage === 1 ? resolvedTopClips : []));
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
      {!isLoading && clips.length === 0 && topClips.length === 0 && <p className={styles.empty}>{t('empty')}</p>}

      <section className={styles.topSection}>
        <h2>{t('topWeek')}</h2>
        <div className={styles.podiumGrid}>
          {topClips.map((clip, index) => (
            <ClipCard
              key={`top-${getClipKey(clip)}`}
              clip={clip}
              playing={playing}
              onPlay={setPlaying}
              rank={index + 1}
              featured
            />
          ))}
        </div>
      </section>

      <section className={styles.restSection}>
        <h2>{t('rest')}</h2>
        <div className={styles.grid}>
        {clips.map((clip) => (
          <ClipCard key={getClipKey(clip)} clip={clip} playing={playing} onPlay={setPlaying} />
        ))}
        </div>
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
