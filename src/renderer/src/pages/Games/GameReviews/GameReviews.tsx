import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { getGameReviewDetail } from '../../../services/games.service';
import { ReviewService } from '../../../services/reviews.service';
import type {
  GameReviewDetail,
  Review,
  ReviewComment,
  ReviewFormValues,
  UploadedReviewAttachment
} from '../../../types/reviews.types';
import { validateReviewForm } from '../../../utilities/reviewValidation';
import { GameSummary } from './GameSummary';
import { RatingPanel } from './RatingPanel';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { ReviewDetailModal } from '../../../components/ui/ReviewDetailModal';
import { useToast } from '../../../components/ui/Toast';
import styles from './GameReviews.module.css';

const getFriendlyErrorMessage = (error: unknown, t: (key: string) => string): string => {
  const axiosError = error as { response?: { status?: number; data?: { detail?: string; title?: string } } };

  if (axiosError.response?.status === 401) {
    return t('errors.sessionExpired');
  }

  if (axiosError.response?.status === 403) {
    return t('errors.forbidden');
  }

  if (axiosError.response?.status === 404) {
    return t('errors.notFound');
  }

  return axiosError.response?.data?.detail || axiosError.response?.data?.title || t('errors.generic');
};

export const GameReviews = (): React.JSX.Element => {
  const { t } = useTranslation('gameReviews');
  const toast = useToast();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  const [detail, setDetail] = useState<GameReviewDetail | null>(null);
  const [commentsByReviewId, setCommentsByReviewId] = useState<Record<string, ReviewComment[]>>({});
  const [visibleComments, setVisibleComments] = useState<Set<string>>(new Set());
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('');

  const numericGameId = Number(gameId);

  const averageRating = useMemo(() => {
    if (!detail || detail.reviews.length === 0) {
      return null;
    }

    return detail.reviews.reduce((sum, review) => sum + review.rating, 0) / detail.reviews.length;
  }, [detail]);

  const loadDetail = useCallback(async (): Promise<void> => {
    if (!Number.isInteger(numericGameId) || numericGameId <= 0) {
      setMessage(t('errors.invalidGame'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getGameReviewDetail(numericGameId);
      setDetail(response);
      setMessage('');
    } catch (error) {
      setMessage(getFriendlyErrorMessage(error, t));
    } finally {
      setIsLoading(false);
    }
  }, [numericGameId, t]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const uploadAttachment = async (file?: File | null): Promise<UploadedReviewAttachment | null> => {
    if (!file) {
      return null;
    }

    return ReviewService.uploadAttachment(file);
  };

  const handleSubmitReview = async (values: ReviewFormValues): Promise<void> => {
    if (!isAuthenticated) {
      toast.warning(t('messages.authRequiredCreate'));
      return;
    }

    const validationMessage = validateReviewForm(values);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    try {
      setIsBusy(true);
      const attachment = await uploadAttachment(values.file);
      const imageUrl = attachment?.url ?? editingReview?.attachmentUrl ?? editingReview?.imageUrl;
      const mediaType = attachment?.mediaType ?? editingReview?.attachmentType;

      if (editingReview) {
        await ReviewService.update(editingReview.id, {
          title: values.title.trim(),
          content: values.content.trim(),
          rating: values.rating,
          imageUrl,
          mediaType
        });
        toast.success(t('messages.updated'));
      } else {
        await ReviewService.create({
          gameId: numericGameId,
          title: values.title.trim(),
          content: values.content.trim(),
          rating: values.rating,
          imageUrl,
          mediaType
        });
        toast.success(t('messages.published'));
      }

      setIsFormOpen(false);
      setEditingReview(null);
      await loadDetail();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteReview = async (reviewId: string): Promise<void> => {
    try {
      setIsBusy(true);
      await ReviewService.delete(reviewId);
      await loadDetail();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, t));
      throw error;
    } finally {
      setIsBusy(false);
    }
  };

  const toggleComments = async (reviewId: string): Promise<void> => {
    const willShow = !visibleComments.has(reviewId);
    setVisibleComments((current) => {
      const next = new Set(current);
      if (willShow) {
        next.add(reviewId);
      } else {
        next.delete(reviewId);
      }
      return next;
    });

    if (willShow && !commentsByReviewId[reviewId]) {
      try {
        const comments = await ReviewService.getComments(reviewId);
        setCommentsByReviewId((current) => ({ ...current, [reviewId]: comments }));
      } catch {
        toast.error(t('errors.commentsLoad'));
      }
    }
  };

  const openCreateForm = (): void => {
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const openEditForm = (review: Review): void => {
    setSelectedReview(null);
    setEditingReview(review);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return <p className={styles.status}>{t('status.loadingDetail')}</p>;
  }

  if (!detail) {
    return (
      <section className={styles.statusPanel}>
        <p>{message || t('errors.detailLoad')}</p>
        <button className={styles.secondaryButton} type="button" onClick={() => navigate('/games')}>
          {t('navigation.backToGames')}
        </button>
      </section>
    );
  }

  return (
    <article className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.secondaryButton} type="button" onClick={() => navigate('/games')}>
          {t('navigation.backToGames')}
        </button>
        {message && <p className={styles.message}>{message}</p>}
      </div>

      <div className={styles.detailGrid}>
        <GameSummary game={detail.game} />

        <main className={styles.centerColumn}>
          {isFormOpen && (
            <ReviewForm
              initialReview={editingReview}
              isSubmitting={isBusy}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingReview(null);
              }}
            onSubmit={handleSubmitReview}
            />
          )}

          <ReviewList
            reviews={detail.reviews}
            onOpenReview={setSelectedReview}
          />
        </main>

        <RatingPanel
          averageRating={averageRating}
          reviewsCount={detail.reviews.length}
          onCreateReview={openCreateForm}
        />
      </div>
      <ReviewDetailModal
        review={selectedReview}
        comments={selectedReview ? commentsByReviewId[selectedReview.id] ?? [] : []}
        commentsVisible={selectedReview ? visibleComments.has(selectedReview.id) : false}
        isBusy={isBusy}
        isAuthenticated={isAuthenticated}
        onEdit={openEditForm}
        onDelete={handleDeleteReview}
        onToggleComments={toggleComments}
        onCommentsChanged={(reviewId, comments) =>
          setCommentsByReviewId((current) => ({ ...current, [reviewId]: comments }))
        }
        onClose={() => setSelectedReview(null)}
      />
    </article>
  );
};
