import type React from 'react';
import { useRef, useState } from 'react';
import { ReviewService } from '../../../services/reviews.service';
import type { ReviewComment } from '../../../types/reviews.types';
import { validateComment } from '../../../utilities/reviewValidation';
import styles from './GameReviews.module.css';

interface ReviewCommentsProps {
  reviewId: string;
  comments: ReviewComment[];
  isAuthenticated: boolean;
  onCommentsChanged: (comments: ReviewComment[]) => void;
  onMessage: (message: string) => void;
}

export const ReviewComments = ({
  reviewId,
  comments,
  isAuthenticated,
  onCommentsChanged,
  onMessage
}: ReviewCommentsProps): React.JSX.Element => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const createComment = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!isAuthenticated) {
      onMessage('Inicia sesion para responder.');
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
      onMessage('Respuesta publicada.');
    } catch {
      onMessage('No se pudo publicar la respuesta. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    try {
      setIsSaving(true);
      await ReviewService.deleteComment(commentId);
      onCommentsChanged(comments.filter((comment) => comment.id !== commentId));
      onMessage('Respuesta eliminada.');
    } catch {
      onMessage('No se pudo eliminar la respuesta.');
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
        <p className={styles.mutedText}>Aun no hay respuestas.</p>
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
                  Responder
                </button>
                {comment.canDelete && (
                  <button
                    className={styles.textButtonDanger}
                    type="button"
                    disabled={isSaving}
                    onClick={() => deleteComment(comment.id)}
                  >
                    Eliminar
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
          maxLength={500}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Responder esta resena"
        />
        <button className={styles.secondaryButton} type="submit" disabled={isSaving}>
          Responder
        </button>
      </form>
    </div>
  );
};
