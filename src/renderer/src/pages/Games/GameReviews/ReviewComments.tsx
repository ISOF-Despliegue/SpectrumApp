import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReviewService } from '../../../services/reviews.service';
import type { ReviewComment } from '../../../types/reviews.types';
import { validateComment } from '../../../utilities/reviewValidation';
import { FIELD_LIMITS } from '../../../utilities/validationRules';
import styles from './GameReviews.module.css';

interface ReviewCommentsProps {
  reviewId: string;
  comments: ReviewComment[];
  isAuthenticated: boolean;
  autoFocusComposer?: boolean;
  onComposerFocused?: () => void;
  onCommentsChanged: (comments: ReviewComment[]) => void;
  onMessage: (message: string) => void;
}

export const ReviewComments = ({
  reviewId,
  comments,
  isAuthenticated,
  autoFocusComposer = false,
  onComposerFocused,
  onCommentsChanged,
  onMessage
}: ReviewCommentsProps): React.JSX.Element => {
  const { t } = useTranslation('gameReviews');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocusComposer) {
      return;
    }

    inputRef.current?.focus();
    onComposerFocused?.();
  }, [autoFocusComposer, onComposerFocused]);

  const createComment = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!isAuthenticated) {
      onMessage(t('comments.loginRequired'));
      return;
    }

    const validationMessage = validateComment(content);
    if (validationMessage) {
      onMessage(validationMessage);
      return;
    }

    try {
      setIsSaving(true);
      const newComment = await ReviewService.createComment(reviewId, content.trim());
      onCommentsChanged([...comments, newComment]);
      setContent('');
      onMessage(t('messages.commentPublished'));
    } catch {
      onMessage(t('messages.commentPublishError'));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    try {
      setIsSaving(true);
      await ReviewService.deleteComment(commentId);
      onCommentsChanged(comments.filter((comment) => comment.id !== commentId));
      onMessage(t('messages.commentDeleted'));
    } catch {
      onMessage(t('messages.commentDeleteError'));
    } finally {
      setIsSaving(false);
    }
  };

  const getAuthorName = (comment: ReviewComment): string => {
    return comment.username || 'Usuario Spectrum';
  };

  const getAuthorInitial = (comment: ReviewComment): string => {
    return getAuthorName(comment).trim().charAt(0).toUpperCase() || 'S';
  };

  const replyToComment = (comment: ReviewComment): void => {
    const mention = `@${getAuthorName(comment).replace(/\s+/g, '')} `;
    setContent((currentContent) => {
      const trimmedContent = currentContent.trimStart();
      return trimmedContent.startsWith(mention) ? trimmedContent : `${mention}${trimmedContent}`;
    });
    inputRef.current?.focus();
  };

  return (
    <div className={styles.commentsBlock}>
      {comments.length === 0 ? (
        <p className={styles.mutedText}>{t('comments.empty')}</p>
      ) : (
        <ul className={styles.commentList}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                {comment.userProfilePicture ? (
                  <img
                    className={styles.commentAvatar}
                    src={comment.userProfilePicture}
                    alt={`Avatar de ${getAuthorName(comment)}`}
                  />
                ) : (
                  <span className={styles.commentAvatarFallback}>{getAuthorInitial(comment)}</span>
                )}
                <div>
                  <strong>{getAuthorName(comment)}</strong>
                  <span>{new Date(comment.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p>{comment.content}</p>
              <div className={styles.commentActions}>
                <button
                  className={styles.textButton}
                  type="button"
                  disabled={!isAuthenticated || isSaving}
                  onClick={() => replyToComment(comment)}
                >
                    {t('comments.reply')}
                </button>
                {comment.canDelete && (
                  <button
                    className={styles.textButtonDanger}
                    type="button"
                    disabled={isSaving}
                    onClick={() => deleteComment(comment.id)}
                  >
                    {t('comments.delete')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.commentForm} onSubmit={createComment}>
        <input
          ref={inputRef}
          value={content}
          maxLength={FIELD_LIMITS.commentContent}
          onChange={(event) => setContent(event.target.value)}
          placeholder={t('comments.placeholder')}
        />
        <button className={styles.secondaryButton} type="submit" disabled={isSaving}>
          {t('comments.reply')}
        </button>
      </form>
    </div>
  );
};
