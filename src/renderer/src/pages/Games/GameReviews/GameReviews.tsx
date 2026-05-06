import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ReviewCardComplete } from '@renderer/components/ui/ReviewCards/ReviewCardComplete'
import styles from './GameReviews.module.css'
import { ReviewForm, type ReviewFormState } from './ReviewForm'
import {
  ReviewService,
  type CreateReviewCommentRequest,
  type CreateReviewRequest,
  type Review,
  type UpdateReviewRequest
} from '../../../services/reviews.service'

const DEFAULT_GAME_ID = '1'
const MAX_TITLE_LENGTH = 120
const MAX_CONTENT_LENGTH = 1200
const MAX_COMMENT_LENGTH = 600
const DEFAULT_RATING = 5

interface GameReviewsRouteState {
  gameTitle?: string
  gameImageUrl?: string | null
}

interface StoredUser {
  id?: string | number
  userId?: string | number
  sub?: string | number
  username?: string
  email?: string
}

interface HttpErrorLike {
  response?: {
    status?: number
    data?: {
      detail?: string
      message?: string
      title?: string
    }
  }
  message?: string
}

type VoteKind = 'like' | 'dislike'

const createEmptyReviewForm = (): ReviewFormState => ({
  title: '',
  content: '',
  rating: DEFAULT_RATING
})

const getErrorMessage = (error: unknown): string => {
  const axiosError = error as HttpErrorLike
  const status = axiosError.response?.status
  const detail =
    axiosError.response?.data?.detail ||
    axiosError.response?.data?.message ||
    axiosError.response?.data?.title

  if (status === 400) {
    return `Datos invalidos. ${detail ?? 'Verifica la informacion enviada.'}`
  }

  if (status === 401) {
    return 'Tu sesion no es valida o expiro. Inicia sesion nuevamente.'
  }

  if (status === 403) {
    return 'No tienes permisos para realizar esta accion.'
  }

  if (status === 404) {
    return 'No se encontro el recurso solicitado.'
  }

  if (status === 500) {
    return 'Error interno del servidor. Intenta nuevamente mas tarde.'
  }

  return detail || axiosError.message || 'Ocurrio un error inesperado.'
}

const getStoredUser = (): StoredUser | null => {
  const rawUser = localStorage.getItem('user')

  if (!rawUser) {
    return null
  }

  try {
    const parsedUser: unknown = JSON.parse(rawUser)

    if (!parsedUser || typeof parsedUser !== 'object') {
      return null
    }

    return parsedUser as StoredUser
  } catch {
    return null
  }
}

const getCurrentUserId = (): string | undefined => {
  const storedUser = getStoredUser()
  const userId = storedUser?.id ?? storedUser?.userId ?? storedUser?.sub
  return userId === undefined ? undefined : String(userId)
}

const hasToken = (): boolean => Boolean(localStorage.getItem('token'))

const getReviewId = (review: Review): string => review.reviewId ?? review.id

const getUsername = (review: Review): string => {
  const username = review.username?.trim()
  return username || 'Usuario de Spectrum'
}

const getReviewTitle = (review: Review): string => {
  const title = review.title?.trim()
  return title || `Resena de ${getUsername(review)}`
}

const getReviewScore = (review: Review): number => {
  const rawScore = review.score ?? review.rating * 20
  return Math.max(0, Math.min(100, Math.round(rawScore)))
}

const formatReviewDate = (value?: string): string => {
  if (!value) {
    return 'Fecha no disponible'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const isOwnReview = (review: Review, currentUserId?: string): boolean => {
  if (review.isOwnReview !== undefined) {
    return review.isOwnReview
  }

  return Boolean(currentUserId && review.userId && String(review.userId) === currentUserId)
}

const getInitialVote = (review: Review): VoteKind | undefined => {
  if (review.likedByUser) {
    return 'like'
  }

  if (review.dislikedByUser) {
    return 'dislike'
  }

  return undefined
}

const validateReviewForm = (form: ReviewFormState): string | null => {
  if (!form.title.trim()) {
    return 'El titulo de la resena es obligatorio.'
  }

  if (form.title.trim().length > MAX_TITLE_LENGTH) {
    return `El titulo no puede superar ${MAX_TITLE_LENGTH} caracteres.`
  }

  if (!form.content.trim()) {
    return 'El contenido de la resena es obligatorio.'
  }

  if (form.content.trim().length > MAX_CONTENT_LENGTH) {
    return `El contenido no puede superar ${MAX_CONTENT_LENGTH} caracteres.`
  }

  if (form.rating < 1 || form.rating > 5) {
    return 'La calificacion debe estar entre 1 y 5.'
  }

  return null
}

export const GameReviews = (): React.JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId: routeGameId } = useParams<{ gameId: string }>()

  const routeState = location.state as GameReviewsRouteState | null
  const initialGameId = routeGameId ?? DEFAULT_GAME_ID
  const gameTitle = routeState?.gameTitle ?? `Videojuego #${initialGameId}`
  const gameImageUrl = routeState?.gameImageUrl ?? null
  const currentUserId = getCurrentUserId()

  const [gameId, setGameId] = useState<string>(initialGameId)
  const [reviews, setReviews] = useState<Review[]>([])
  const [createForm, setCreateForm] = useState<ReviewFormState>(createEmptyReviewForm)
  const [editForm, setEditForm] = useState<ReviewFormState>(createEmptyReviewForm)
  const [message, setMessage] = useState<string>('Carga resenas o crea una nueva.')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<string>('')
  const [votingReviewId, setVotingReviewId] = useState<string | null>(null)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const [commentingReviewId, setCommentingReviewId] = useState<string | null>(null)
  const [localVotes, setLocalVotes] = useState<Record<string, VoteKind | undefined>>({})

  const loadReviews = async (targetGameId = gameId): Promise<void> => {
    const trimmedGameId = targetGameId.trim()

    if (!trimmedGameId) {
      setMessage('Debes ingresar el ID del videojuego.')
      return
    }

    try {
      setIsLoading(true)
      setMessage('Cargando resenas...')

      const data = await ReviewService.getByGame(trimmedGameId)

      setReviews(data)
      setLocalVotes((previousVotes) => {
        const nextVotes = { ...previousVotes }
        data.forEach((review) => {
          const reviewId = getReviewId(review)
          nextVotes[reviewId] = previousVotes[reviewId] ?? getInitialVote(review)
        })
        return nextVotes
      })
      setMessage(
        data.length === 0
          ? 'Este videojuego todavia no tiene resenas. Puedes crear la primera.'
          : `Resenas encontradas: ${data.length}`
      )
    } catch (error) {
      const status = (error as HttpErrorLike).response?.status

      setReviews([])
      if (status === 404) {
        setMessage('Este videojuego todavia no tiene resenas. Puedes crear la primera.')
        return
      }

      setMessage(`No se pudieron cargar las resenas. ${getErrorMessage(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCreateForm = (field: keyof ReviewFormState, value: string | number): void => {
    setCreateForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }))
  }

  const updateEditForm = (field: keyof ReviewFormState, value: string | number): void => {
    setEditForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }))
  }

  const createReview = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    if (!hasToken()) {
      setMessage('Debes iniciar sesion para crear una resena.')
      return
    }

    const validationMessage = validateReviewForm(createForm)

    if (validationMessage) {
      setMessage(validationMessage)
      return
    }

    try {
      setIsLoading(true)
      setMessage('Creando resena...')

      const payload: CreateReviewRequest = {
        gameId,
        title: createForm.title.trim(),
        content: createForm.content.trim(),
        rating: createForm.rating
      }

      const createdReview = await ReviewService.create(payload)
      setReviews((currentReviews) => [createdReview, ...currentReviews])
      setCreateForm(createEmptyReviewForm())
      setMessage('Resena creada correctamente.')
    } catch (error) {
      setMessage(`No se pudo crear la resena. ${getErrorMessage(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (review: Review): void => {
    const reviewId = getReviewId(review)

    if (!isOwnReview(review, currentUserId)) {
      setMessage('Solo puedes editar tus propias resenas.')
      return
    }

    setEditingReviewId(reviewId)
    setReplyingReviewId(null)
    setEditForm({
      title: getReviewTitle(review),
      content: review.content,
      rating: review.rating
    })
  }

  const cancelEditing = (): void => {
    setEditingReviewId(null)
    setEditForm(createEmptyReviewForm())
  }

  const updateReview = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    if (!editingReviewId) {
      return
    }

    if (!hasToken()) {
      setMessage('Debes iniciar sesion para editar una resena.')
      return
    }

    const validationMessage = validateReviewForm(editForm)

    if (validationMessage) {
      setMessage(validationMessage)
      return
    }

    try {
      setIsLoading(true)
      setMessage('Actualizando resena...')

      const payload: UpdateReviewRequest = {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        rating: editForm.rating
      }

      const updatedReview = await ReviewService.update(editingReviewId, payload)

      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          getReviewId(review) === editingReviewId
            ? { ...review, ...(updatedReview ?? {}), ...payload }
            : review
        )
      )
      cancelEditing()
      setMessage('Resena actualizada correctamente.')
    } catch (error) {
      setMessage(`No se pudo actualizar la resena. ${getErrorMessage(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteReview = async (review: Review): Promise<void> => {
    const reviewId = getReviewId(review)

    if (!isOwnReview(review, currentUserId)) {
      setMessage('Solo puedes eliminar tus propias resenas.')
      return
    }

    if (!hasToken()) {
      setMessage('Debes iniciar sesion para eliminar una resena.')
      return
    }

    const confirmDelete = window.confirm('Seguro que deseas eliminar esta resena?')

    if (!confirmDelete) {
      return
    }

    try {
      setDeletingReviewId(reviewId)
      setMessage('Eliminando resena...')

      await ReviewService.delete(reviewId)

      setReviews((currentReviews) =>
        currentReviews.filter((currentReview) => getReviewId(currentReview) !== reviewId)
      )
      setMessage('Resena eliminada correctamente.')
    } catch (error) {
      setMessage(`No se pudo eliminar la resena. ${getErrorMessage(error)}`)
    } finally {
      setDeletingReviewId(null)
    }
  }

  const voteReview = async (review: Review, voteKind: VoteKind): Promise<void> => {
    const reviewId = getReviewId(review)

    if (isOwnReview(review, currentUserId)) {
      setMessage('No puedes votar tu propia resena.')
      return
    }

    if (!hasToken()) {
      setMessage('Debes iniciar sesion para votar una resena.')
      return
    }

    if (votingReviewId) {
      return
    }

    try {
      setVotingReviewId(reviewId)

      const result = await ReviewService.vote(reviewId, {
        isPositive: voteKind === 'like'
      })

      if (!result.success) {
        setMessage('El backend no confirmo el voto. Intenta nuevamente.')
        return
      }

      setReviews((currentReviews) =>
        currentReviews.map((currentReview) =>
          getReviewId(currentReview) === reviewId
            ? {
                ...currentReview,
                likesCount: result.updatedLikes,
                dislikesCount: result.updatedDislikes
              }
            : currentReview
        )
      )
      setLocalVotes((currentVotes) => ({
        ...currentVotes,
        [reviewId]: currentVotes[reviewId] === voteKind ? undefined : voteKind
      }))
      setMessage(voteKind === 'like' ? 'Like registrado.' : 'Dislike registrado.')
    } catch (error) {
      setMessage(`No se pudo registrar el voto. ${getErrorMessage(error)}`)
    } finally {
      setVotingReviewId(null)
    }
  }

  const startReplying = (review: Review): void => {
    if (isOwnReview(review, currentUserId)) {
      setMessage('No puedes responder tu propia resena desde esta vista.')
      return
    }

    setEditingReviewId(null)
    setReplyingReviewId(getReviewId(review))
    setReplyContent('')
  }

  const cancelReplying = (): void => {
    setReplyingReviewId(null)
    setReplyContent('')
  }

  const createComment = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    if (!replyingReviewId) {
      return
    }

    if (!hasToken()) {
      setMessage('Debes iniciar sesion para responder una resena.')
      return
    }

    const trimmedComment = replyContent.trim()

    if (!trimmedComment) {
      setMessage('El comentario no puede estar vacio.')
      return
    }

    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      setMessage(`El comentario no puede superar ${MAX_COMMENT_LENGTH} caracteres.`)
      return
    }

    try {
      setCommentingReviewId(replyingReviewId)
      setMessage('Enviando comentario...')

      const payload: CreateReviewCommentRequest = {
        content: trimmedComment
      }

      await ReviewService.createComment(replyingReviewId, payload)
      cancelReplying()
      setMessage('Comentario agregado correctamente.')
    } catch (error) {
      const status = (error as HttpErrorLike).response?.status
      const fallbackMessage =
        status === 404
          ? 'El backend no expone comentarios para resenas en este momento.'
          : getErrorMessage(error)

      setMessage(`No se pudo agregar el comentario. ${fallbackMessage}`)
    } finally {
      setCommentingReviewId(null)
    }
  }

  const reportReview = (): void => {
    setMessage('La funcionalidad de reportes esta pendiente de conectar con el backend.')
  }

  useEffect(() => {
    void loadReviews(initialGameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <div className={styles.gameInfo}>
          {gameImageUrl && <img className={styles.gameImage} src={gameImageUrl} alt={gameTitle} />}

          <div>
            <p className={styles.badge}>Spectrum Reviews</p>

            <h1 className={styles.title}>{gameTitle}</h1>

            <p className={styles.description}>
              ID del juego: <strong>{gameId}</strong>. Crea, consulta y administra resenas asociadas
              a este videojuego.
            </p>
          </div>
        </div>

        <button className={styles.secondaryButton} type="button" onClick={() => navigate('/games')}>
          Volver a videojuegos
        </button>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Buscar resenas por juego</h2>

        <div className={styles.searchRow}>
          <label className={styles.fieldLabel} htmlFor="game-review-search">
            ID del videojuego
          </label>
          <input
            id="game-review-search"
            className={styles.input}
            type="text"
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            placeholder="ID del videojuego"
          />

          <button
            className={styles.button}
            type="button"
            onClick={() => void loadReviews()}
            disabled={isLoading}
          >
            Buscar
          </button>
        </div>

        <p className={styles.message} role="status">
          {message}
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Crear resena</h2>

        <ReviewForm
          idPrefix="review"
          form={createForm}
          titleLabel="Titulo de la resena"
          submitLabel={isLoading ? 'Procesando...' : 'Crear resena'}
          isDisabled={isLoading}
          maxTitleLength={MAX_TITLE_LENGTH}
          maxContentLength={MAX_CONTENT_LENGTH}
          onChange={updateCreateForm}
          onSubmit={(event) => void createReview(event)}
        />
      </section>

      <section className={styles.reviewsGrid} aria-label="Resenas del videojuego">
        {reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No hay resenas todavia</h2>
            <p>Crea la primera resena para este videojuego.</p>
          </div>
        ) : (
          reviews.map((review) => {
            const reviewId = getReviewId(review)
            const ownReview = isOwnReview(review, currentUserId)
            const currentVote = localVotes[reviewId] ?? getInitialVote(review)

            return (
              <div className={styles.reviewItem} key={reviewId}>
                <ReviewCardComplete
                  gameCover={review.gameCoverUrl ?? gameImageUrl ?? undefined}
                  userImage={review.userProfileImageUrl ?? review.profilePicture ?? undefined}
                  username={getUsername(review)}
                  reviewDate={formatReviewDate(review.createdAt)}
                  reviewTitle={getReviewTitle(review)}
                  reviewContent={review.content}
                  likes={review.likesCount ?? 0}
                  dislikes={review.dislikesCount ?? 0}
                  score={getReviewScore(review)}
                  reviewImage={review.imageUrl ?? undefined}
                  isOwnReview={ownReview}
                  likedByUser={currentVote === 'like'}
                  dislikedByUser={currentVote === 'dislike'}
                  canVote={!ownReview}
                  canEdit={ownReview}
                  canDelete={ownReview}
                  canReply={!ownReview}
                  canReport={!ownReview}
                  isVoting={votingReviewId === reviewId}
                  isDeleting={deletingReviewId === reviewId}
                  onLike={() => void voteReview(review, 'like')}
                  onDislike={() => void voteReview(review, 'dislike')}
                  onEdit={() => startEditing(review)}
                  onDelete={() => void deleteReview(review)}
                  onReply={() => startReplying(review)}
                  onReport={reportReview}
                />

                {editingReviewId === reviewId && (
                  <div className={styles.inlineForm}>
                    <h3 className={styles.inlineTitle}>Editar resena</h3>
                    <ReviewForm
                      idPrefix={`edit-${reviewId}`}
                      form={editForm}
                      titleLabel="Titulo de la resena"
                      submitLabel="Guardar cambios"
                      isDisabled={isLoading}
                      maxTitleLength={MAX_TITLE_LENGTH}
                      maxContentLength={MAX_CONTENT_LENGTH}
                      onChange={updateEditForm}
                      onSubmit={(event) => void updateReview(event)}
                      onCancel={cancelEditing}
                    />
                  </div>
                )}

                {replyingReviewId === reviewId && (
                  <form
                    className={styles.inlineForm}
                    onSubmit={(event) => void createComment(event)}
                  >
                    <h3 className={styles.inlineTitle}>Responder resena</h3>
                    <label className={styles.fieldLabel} htmlFor={`reply-${reviewId}`}>
                      Comentario
                    </label>
                    <textarea
                      id={`reply-${reviewId}`}
                      className={styles.textarea}
                      value={replyContent}
                      onChange={(event) => setReplyContent(event.target.value)}
                      rows={3}
                      maxLength={MAX_COMMENT_LENGTH}
                      placeholder="Escribe tu comentario"
                    />

                    <div className={styles.inlineActions}>
                      <button
                        className={styles.button}
                        type="submit"
                        disabled={commentingReviewId === reviewId}
                      >
                        {commentingReviewId === reviewId ? 'Enviando...' : 'Enviar comentario'}
                      </button>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={cancelReplying}
                        disabled={commentingReviewId === reviewId}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )
          })
        )}
      </section>
    </article>
  )
}
