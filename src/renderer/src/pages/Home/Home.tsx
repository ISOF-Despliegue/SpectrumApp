import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { DropsService } from '../../services/drops.service';
import { HomeService } from '../../services/home.service';
import { DropEvent } from '../../types/drops.types';
import { GlobalSearchItem, HomeDashboard } from '../../types/home.types';

export const Home = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [selectedDrop, setSelectedDrop] = useState<DropEvent | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadDashboard = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      setDashboard(await HomeService.getDashboard());
    } catch {
      setError('No se pudo cargar el inicio.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const normalized = searchText.trim();
    if (normalized.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await HomeService.searchGlobal(normalized);
        setSearchResults([...result.games, ...result.users]);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  const countdownText = useMemo(() => {
    if (!selectedDrop) return '';
    const startsInMs = new Date(selectedDrop.startAt).getTime() - Date.now();
    if (startsInMs <= 0) return 'El sorteo está por comenzar.';
    const minutes = Math.ceil(startsInMs / 60000);
    return `Faltan ${minutes} min para que empiece.`;
  }, [selectedDrop]);

  const openSearchResult = (item: GlobalSearchItem): void => {
    setSearchText('');
    setSearchResults([]);
    if (item.type === 'game') {
      navigate(`/games/${item.id}/reviews`);
      return;
    }
    navigate(`/users/${item.id}`);
  };

  const joinDrop = async (drop: DropEvent): Promise<void> => {
    setMessage(null);
    setError(null);
    try {
      await DropsService.join(drop.eventId);
      setSelectedDrop(drop);
      setMessage('Has entrado al sorteo.');
      await loadDashboard();
    } catch {
      setError('No fue posible participar en este sorteo.');
    }
  };

  const claimDrop = async (): Promise<void> => {
    if (!selectedDrop) return;
    setMessage(null);
    setError(null);
    try {
      const result = await DropsService.claim(selectedDrop.eventId);
      if (result.success) {
        setMessage('Ganaste. Tu recompensa llegará a tu correo en las próximas 24 horas.');
      } else if (result.winnerUsername) {
        setMessage(`Sorteo finalizado. Ganador: ${result.winnerUsername}.`);
      } else {
        setMessage('El sorteo ya no admite reclamos o no hay códigos disponibles.');
      }
      await loadDashboard();
    } catch {
      setError('No fue posible reclamar este sorteo.');
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.topTools}>
        <div className={styles.searchBox}>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Buscar videojuegos o usuarios"
            aria-label="Buscar videojuegos o usuarios"
          />
          {(searchResults.length > 0 || isSearching) && (
            <div className={styles.searchResults}>
              {isSearching && <p>Buscando...</p>}
              {!isSearching && searchResults.map((item) => (
                <button key={`${item.type}-${item.id}`} type="button" onClick={() => openSearchResult(item)}>
                  {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" />}
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.type === 'game' ? 'Videojuego' : 'Usuario'} {item.subtitle ? `- ${item.subtitle}` : ''}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <header className={styles.banner}>
        <h1>{dashboard?.bannerTitle || 'SPECTRUM'}</h1>
        <p>{dashboard?.bannerSubtitle || 'Descubre juegos, reseñas y sorteos.'}</p>
      </header>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>Cargando inicio...</p>}

      <main className={styles.columns}>
        <section className={styles.panel}>
          <h2>Juegos mas recientes</h2>
          <div className={styles.gameGrid}>
            {(dashboard?.recentGames || []).map((game) => (
              <button key={game.gameId} type="button" className={styles.gameCard} onClick={() => navigate(`/games/${game.gameId}/reviews`)}>
                {game.coverImageUrl && <img src={game.coverImageUrl} alt="" loading="lazy" />}
                <span>{game.title}</span>
              </button>
            ))}
          </div>
          {!isLoading && dashboard?.recentGames.length === 0 && <p className={styles.empty}>No hay juegos recientes.</p>}
        </section>

        <section className={`${styles.panel} ${styles.centerPanel}`}>
          <h2>Resenas populares hoy</h2>
          <div className={styles.reviewList}>
            {(dashboard?.popularReviewsToday || []).map((review) => (
              <button key={review.reviewId} type="button" className={styles.reviewCard} onClick={() => navigate(`/games/${review.gameId}/reviews`)}>
                {review.gameCoverUrl && <img src={review.gameCoverUrl} alt="" loading="lazy" />}
                <span>
                  <strong>{review.title}</strong>
                  <small>{review.username} - {review.gameTitle}</small>
                  <em>{review.likesCount} likes - {review.commentsCount} respuestas</em>
                </span>
              </button>
            ))}
          </div>
          {!isLoading && dashboard?.popularReviewsToday.length === 0 && <p className={styles.empty}>No hay actividad destacada hoy.</p>}
        </section>

        <section className={styles.panel}>
          <h2>Sorteo de la semana</h2>
          <div className={styles.dropList}>
            {(dashboard?.weeklyDrops || []).map((drop) => (
              <article className={styles.dropCard} key={drop.eventId}>
                {drop.imageUrl && <img src={drop.imageUrl} alt="" loading="lazy" />}
                <strong>{drop.title}</strong>
                <span>{drop.gameTitle} - {drop.platform}</span>
                <small>{new Date(drop.startAt).toLocaleDateString()} - {drop.status}</small>
                {drop.winnerUsername ? (
                  <p>Ganador: {drop.winnerUsername}</p>
                ) : (
                  <button type="button" onClick={() => joinDrop(drop)}>Participar</button>
                )}
              </article>
            ))}
          </div>
          {!isLoading && dashboard?.weeklyDrops.length === 0 && <p className={styles.empty}>No hay sorteos esta semana.</p>}
        </section>
      </main>

      {selectedDrop && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setSelectedDrop(null)}>
          <section className={styles.dropModal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.closeButton} type="button" onClick={() => setSelectedDrop(null)}>x</button>
            <h2>Has entrado al sorteo</h2>
            {selectedDrop.imageUrl && <img src={selectedDrop.imageUrl} alt="" />}
            <h3>{selectedDrop.gameTitle}</h3>
            <p>{new Date(selectedDrop.startAt).toLocaleString()} - {new Date(selectedDrop.endAt).toLocaleString()}</p>
            <strong>{countdownText}</strong>

            {selectedDrop.status === 'REVEAL_ACTIVE' ? (
              <div className={styles.claimBox}>
                <p>La revelación está activa. Presiona reclamar para intentar obtener un código disponible.</p>
                <button type="button" onClick={claimDrop}>Canjear código</button>
              </div>
            ) : (
              <p>La reclamación se habilitará cuando llegue la hora de revelación.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
