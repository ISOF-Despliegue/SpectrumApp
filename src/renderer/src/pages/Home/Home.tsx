import { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { DropsService } from '../../services/drops.service';
import { DropEvent } from '../../types/drops.types';

export const Home = (): React.JSX.Element => {
  const [scope, setScope] = useState('CURRENT');
  const [events, setEvents] = useState<DropEvent[]>([]);
  const [claimCodes, setClaimCodes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadEvents = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await DropsService.listPublic(scope, 1, 12);
      setEvents(result.items);
    } catch {
      setError('No se pudieron cargar los sorteos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [scope]);

  const join = async (eventId: string): Promise<void> => {
    setMessage(null);
    try {
      await DropsService.join(eventId);
      setMessage('Te uniste al sorteo.');
      await loadEvents();
    } catch {
      setError('No fue posible unirte al sorteo.');
    }
  };

  const claim = async (eventId: string): Promise<void> => {
    setMessage(null);
    try {
      const result = await DropsService.claim(eventId, claimCodes[eventId] || '');
      setMessage(result.success
        ? 'Ganaste. Tu recompensa llegara a tu correo en las siguientes 24 horas.'
        : result.winnerUsername
          ? `El ganador es ${result.winnerUsername}.`
          : 'El codigo no pudo reclamarse.');
      await loadEvents();
    } catch {
      setError('No fue posible reclamar el sorteo.');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Sorteos Spectrum</h1>
          <p>Unete, espera la revelacion y escribe el codigo para reclamar primero.</p>
        </div>
        <div className={styles.tabs}>
          <button className={scope === 'CURRENT' ? styles.activeTab : ''} onClick={() => setScope('CURRENT')}>Activos</button>
          <button className={scope === 'UPCOMING' ? styles.activeTab : ''} onClick={() => setScope('UPCOMING')}>Proximos</button>
          <button className={scope === 'PAST' ? styles.activeTab : ''} onClick={() => setScope('PAST')}>Finalizados</button>
        </div>
      </header>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>Cargando sorteos...</p>}
      {!isLoading && events.length === 0 && <p className={styles.empty}>No hay sorteos para mostrar.</p>}

      <section className={styles.grid}>
        {events.map((event) => (
          <article className={styles.card} key={event.eventId}>
            {event.imageUrl && <img src={event.imageUrl} alt="" loading="lazy" />}
            <div className={styles.cardBody}>
              <div className={styles.titleRow}>
                <h2>{event.title}</h2>
                <span>{event.status}</span>
              </div>
              <p>{event.description}</p>
              <dl>
                <div><dt>Juego</dt><dd>{event.gameTitle}</dd></div>
                <div><dt>Plataforma</dt><dd>{event.platform}</dd></div>
                <div><dt>Lugares</dt><dd>{event.availableSlots}/{event.totalSlots}</dd></div>
                <div><dt>Fin</dt><dd>{new Date(event.endAt).toLocaleString()}</dd></div>
              </dl>

              {event.winnerUsername && (
                <p className={styles.winner}>Ganador: {event.winnerUsername}</p>
              )}

              {event.status === 'ACTIVE' && (
                <button onClick={() => join(event.eventId)}>Unirme</button>
              )}

              {event.publicChallengeCode && !event.winnerUsername && (
                <div className={styles.claimBox}>
                  <p>Escribe en el cuadro de abajo:</p>
                  <strong>{event.publicChallengeCode}</strong>
                  <input
                    value={claimCodes[event.eventId] || ''}
                    onPaste={(pasteEvent) => pasteEvent.preventDefault()}
                    onChange={(inputEvent) => setClaimCodes((current) => ({
                      ...current,
                      [event.eventId]: inputEvent.target.value
                    }))}
                  />
                  <button onClick={() => claim(event.eventId)}>Reclamar</button>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
