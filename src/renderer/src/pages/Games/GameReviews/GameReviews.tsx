import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './GameReviews.module.css';
import {
  ReviewService,
  type CreateReviewRequest,
  type Review
} from '../../../services/reviews.service';

const DEFAULT_GAME_ID = '1';

interface GameReviewsRouteState {
  gameTitle?: string;
  gameImageUrl?: string | null;
}

const getErrorMessage = (error: unknown): string => {
  const axiosError = error as {
    response?: {
      status?: number;
      data?: {
        detail?: string;
        message?: string;
        title?: string;
      };
    };
    message?: string;
  };

  const status = axiosError.response?.status;
  const detail =
    axiosError.response?.data?.detail ||
    axiosError.response?.data?.message ||
    axiosError.response?.data?.title;

  if (status === 400) {
    return `Datos inválidos. ${detail ?? 'Verifica la información enviada.'}`;
  }

  if (status === 401) {
    return 'Tu sesión no es válida o expiró. Inicia sesión nuevamente.';
  }

  if (status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (status === 404) {
    return 'No se encontró el recurso solicitado.';
  }

  if (status === 500) {
    return 'Error interno del servidor. Revisa la consola del backend.';
  }

  return detail || axiosError.message || 'Ocurrió un error inesperado.';
};

export const GameReviews = (): React.JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId: routeGameId } = useParams<{ gameId: string }>();

  const routeState = location.state as GameReviewsRouteState | null;

  const initialGameId = routeGameId ?? DEFAULT_GAME_ID;
  const gameTitle = routeState?.gameTitle ?? `Videojuego #${initialGameId}`;
  const gameImageUrl = routeState?.gameImageUrl ?? null;

  const [gameId, setGameId] = useState<string>(initialGameId);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('Carga reseñas o crea una nueva.');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const hasToken = (): boolean => {
    return Boolean(localStorage.getItem('token'));
  };

  const loadReviews = async (): Promise<void> => {
  if (!gameId.trim()) {
    setMessage('Debes ingresar el ID del videojuego.');
    return;
  }

  try {
    setIsLoading(true);
    setMessage('Cargando reseñas...');

    const data = await ReviewService.getByGame(gameId);

    setReviews(data);
    setMessage(
      data.length === 0
        ? 'Este videojuego todavía no tiene reseñas. Puedes crear la primera.'
        : `Reseñas encontradas: ${data.length}`
    );
  } catch (error: any) {
    console.error('Error al cargar reseñas:', error);

    if (error?.response?.status === 404) {
      setReviews([]);
      setMessage('Este videojuego todavía no tiene reseñas. Puedes crear la primera.');
      return;
    }

    setReviews([]);
    setMessage(`No se pudieron cargar las reseñas. ${getErrorMessage(error)}`);
  } finally {
    setIsLoading(false);
  }
};

  const createReview = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (!hasToken()) {
      setMessage('Debes iniciar sesión para crear una reseña.');
      return;
    }

    if (!title.trim()) {
      setMessage('El título de la reseña es obligatorio.');
      return;
    }

    if (!content.trim()) {
      setMessage('El contenido de la reseña es obligatorio.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setMessage('La calificación debe estar entre 1 y 5.');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Creando reseña...');

      const payload: CreateReviewRequest = {
        gameId,
        title: title.trim(),
        content: content.trim(),
        rating
      };

      await ReviewService.create(payload);

      setTitle('');
      setContent('');
      setRating(5);

      await loadReviews();
      setMessage('Reseña creada correctamente.');
    } catch (error) {
      console.error('Error al crear reseña:', error);
      setMessage(`No se pudo crear la reseña. ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (reviewId: string): Promise<void> => {
    if (!hasToken()) {
      setMessage('Debes iniciar sesión para eliminar una reseña.');
      return;
    }

    const confirmDelete = window.confirm('¿Seguro que deseas eliminar esta reseña?');

    if (!confirmDelete) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Eliminando reseña...');

      await ReviewService.delete(reviewId);

      await loadReviews();
      setMessage('Reseña eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      setMessage(`No se pudo eliminar la reseña. ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const voteReview = async (
    reviewId: string,
    isPositive: boolean
  ): Promise<void> => {
    if (!hasToken()) {
      setMessage('Debes iniciar sesión para votar una reseña.');
      return;
    }

    try {
      setIsLoading(true);

      await ReviewService.vote(reviewId, { isPositive });

      await loadReviews();
      setMessage(isPositive ? 'Like registrado.' : 'Dislike registrado.');
    } catch (error) {
      console.error('Error al votar reseña:', error);
      setMessage(`No se pudo registrar el voto. ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <div className={styles.gameInfo}>
          {gameImageUrl && (
            <img
              className={styles.gameImage}
              src={gameImageUrl}
              alt={gameTitle}
            />
          )}

          <div>
            <p className={styles.badge}>Spectrum Reviews</p>

            <h1 className={styles.title}>{gameTitle}</h1>

            <p className={styles.description}>
              ID del juego: <strong>{gameId}</strong>. Crea, consulta y administra reseñas
              asociadas a este videojuego.
            </p>
          </div>
        </div>

        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => navigate('/games')}
        >
          Volver a videojuegos
        </button>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Buscar reseñas por juego</h2>

        <div className={styles.searchRow}>
          <input
            className={styles.input}
            type="text"
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            placeholder="ID del videojuego"
          />

          <button
            className={styles.button}
            type="button"
            onClick={loadReviews}
            disabled={isLoading}
          >
            Buscar
          </button>
        </div>

        <p className={styles.message}>{message}</p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Crear reseña</h2>

        <form className={styles.form} onSubmit={createReview}>
          <input
            className={styles.input}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Título de la reseña"
            maxLength={120}
          />

          <textarea
            className={styles.textarea}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Escribe tu opinión del videojuego"
            rows={5}
            maxLength={1200}
          />

          <input
            className={styles.input}
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            placeholder="Calificación"
          />

          <button className={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? 'Procesando...' : 'Crear reseña'}
          </button>
        </form>
      </section>

      <section className={styles.reviewsGrid}>
        {reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No hay reseñas todavía</h2>
            <p>Crea la primera reseña para este videojuego.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <article className={styles.reviewCard} key={review.id}>
              <div className={styles.reviewHeader}>
                <div>
                  <h2>{review.title}</h2>
                  <p>Calificación: {review.rating}/5</p>
                </div>

                <button
                  className={styles.dangerButton}
                  type="button"
                  onClick={() => deleteReview(review.id)}
                  disabled={isLoading}
                >
                  Eliminar
                </button>
              </div>

              <p className={styles.reviewContent}>{review.content}</p>

              <div className={styles.voteActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => voteReview(review.id, true)}
                  disabled={isLoading}
                >
                  Like {review.likesCount ?? 0}
                </button>

                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => voteReview(review.id, false)}
                  disabled={isLoading}
                >
                  Dislike {review.dislikesCount ?? 0}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </article>
  );
};
