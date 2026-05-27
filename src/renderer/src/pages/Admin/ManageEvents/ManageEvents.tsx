import { useEffect, useState } from 'react';
import styles from './ManageEvents.module.css';
import { DropsService } from '../../../services/drops.service';
import { DropEvent, DropEventPayload } from '../../../types/drops.types';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';

const toLocalInput = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const createEmptyForm = (): DropEventPayload => {
  const now = new Date();
  return {
    title: '',
    description: '',
    imageUrl: '',
    gameTitle: '',
    platform: 'PC',
    startAt: toLocalInput(new Date(now.getTime() + 60 * 60 * 1000)),
    joinDeadlineAt: toLocalInput(new Date(now.getTime() + 2 * 60 * 60 * 1000)),
    revealAt: toLocalInput(new Date(now.getTime() + 3 * 60 * 60 * 1000)),
    endAt: toLocalInput(new Date(now.getTime() + 4 * 60 * 60 * 1000)),
    totalSlots: 100,
    publicChallengeCode: '',
    publishNow: false
  };
};

const toPayload = (form: DropEventPayload): DropEventPayload => ({
  ...form,
  rawgGameId: form.rawgGameId ? Number(form.rawgGameId) : null,
  totalSlots: Number(form.totalSlots),
  startAt: new Date(form.startAt).toISOString(),
  joinDeadlineAt: new Date(form.joinDeadlineAt).toISOString(),
  revealAt: new Date(form.revealAt).toISOString(),
  endAt: new Date(form.endAt).toISOString()
});

const fromEvent = (event: DropEvent): DropEventPayload => ({
  title: event.title,
  description: event.description,
  imageUrl: event.imageUrl,
  gameTitle: event.gameTitle,
  rawgGameId: event.rawgGameId,
  platform: event.platform,
  startAt: toLocalInput(new Date(event.startAt)),
  joinDeadlineAt: toLocalInput(new Date(event.joinDeadlineAt)),
  revealAt: toLocalInput(new Date(event.revealAt)),
  endAt: toLocalInput(new Date(event.endAt)),
  totalSlots: event.totalSlots,
  publicChallengeCode: event.publicChallengeCode,
  publishNow: false
});

export const AdminManageEvents = (): React.JSX.Element => {
  const [scope, setScope] = useState('CURRENT');
  const [events, setEvents] = useState<DropEvent[]>([]);
  const [form, setForm] = useState<DropEventPayload>(createEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rewardEventId, setRewardEventId] = useState<string | null>(null);
  const [rewardCode, setRewardCode] = useState('');
  const [finishEventId, setFinishEventId] = useState<string | null>(null);
  const [isRewardConfirmOpen, setIsRewardConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await DropsService.listAdmin(scope, 1, 20);
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

  const updateField = (field: keyof DropEventPayload, value: string | number | boolean): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!form.title.trim() || !form.gameTitle.trim() || !form.platform.trim()) {
      return 'Titulo, juego y plataforma son obligatorios.';
    }
    if (!form.publicChallengeCode.trim() || form.publicChallengeCode.length > 50) {
      return 'El codigo publico es obligatorio y maximo de 50 caracteres.';
    }
    if (Number(form.totalSlots) <= 0) {
      return 'Los lugares totales deben ser mayores a cero.';
    }
    if (!(new Date(form.startAt) < new Date(form.joinDeadlineAt) &&
      new Date(form.joinDeadlineAt) <= new Date(form.revealAt) &&
      new Date(form.revealAt) < new Date(form.endAt))) {
      return 'Las fechas deben seguir inicio, cierre, revelacion y fin.';
    }
    return null;
  };

  const handleSubmit = async (): Promise<void> => {
    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (editingId) {
        await DropsService.update(editingId, toPayload(form));
        setMessage('Sorteo actualizado.');
      } else {
        await DropsService.create(toPayload(form));
        setMessage('Sorteo creado.');
      }
      setForm(createEmptyForm());
      setEditingId(null);
      await loadEvents();
    } catch {
      setError('No se pudo guardar el sorteo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReward = async (): Promise<void> => {
    if (!rewardEventId || !rewardCode.trim()) return;
    if (rewardCode.length > 50) {
      setError('El codigo real no debe superar 50 caracteres.');
      return;
    }
    setIsLoading(true);
    try {
      await DropsService.sendReward(rewardEventId, rewardCode.trim());
      setRewardCode('');
      setRewardEventId(null);
      setMessage('Recompensa marcada como enviada.');
      await loadEvents();
    } catch {
      setError('No se pudo enviar la recompensa.');
    } finally {
      setIsLoading(false);
    }
  };

  const runAction = async (action: () => Promise<unknown>, success: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await action();
      setMessage(success);
      await loadEvents();
    } catch {
      setError('No se pudo completar la accion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Gestionar sorteos</h1>
          <p>Eventos de codigos de juego con reto publico, ganador unico y entrega trazable.</p>
        </div>
        <select value={scope} onChange={(event) => setScope(event.target.value)}>
          <option value="CURRENT">Actuales</option>
          <option value="UPCOMING">Proximos</option>
          <option value="PAST">Pasados</option>
          <option value="ALL">Todos</option>
        </select>
      </header>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.formPanel}>
        <h2>{editingId ? 'Editar sorteo' : 'Crear sorteo'}</h2>
        <div className={styles.formGrid}>
          <input placeholder="Titulo" value={form.title} onChange={(event) => updateField('title', event.target.value)} />
          <input placeholder="Juego" value={form.gameTitle} onChange={(event) => updateField('gameTitle', event.target.value)} />
          <input placeholder="Plataforma" value={form.platform} onChange={(event) => updateField('platform', event.target.value)} />
          <input placeholder="RAWG ID" type="number" value={form.rawgGameId ?? ''} onChange={(event) => updateField('rawgGameId', event.target.value)} />
          <input placeholder="Imagen URL" value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} />
          <input placeholder="Codigo publico" maxLength={50} value={form.publicChallengeCode} onChange={(event) => updateField('publicChallengeCode', event.target.value)} />
          <textarea placeholder="Descripcion" value={form.description} onChange={(event) => updateField('description', event.target.value)} />
          <input type="number" min="1" value={form.totalSlots} onChange={(event) => updateField('totalSlots', Number(event.target.value))} />
          <label>Inicio<input type="datetime-local" value={form.startAt} onChange={(event) => updateField('startAt', event.target.value)} /></label>
          <label>Cierre union<input type="datetime-local" value={form.joinDeadlineAt} onChange={(event) => updateField('joinDeadlineAt', event.target.value)} /></label>
          <label>Revelacion<input type="datetime-local" value={form.revealAt} onChange={(event) => updateField('revealAt', event.target.value)} /></label>
          <label>Fin<input type="datetime-local" value={form.endAt} onChange={(event) => updateField('endAt', event.target.value)} /></label>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={Boolean(form.publishNow)} onChange={(event) => updateField('publishNow', event.target.checked)} />
            Publicar al guardar
          </label>
        </div>
        <div className={styles.actions}>
          <button onClick={handleSubmit} disabled={isLoading}>{editingId ? 'Guardar cambios' : 'Crear sorteo'}</button>
          {editingId && <button onClick={() => { setEditingId(null); setForm(createEmptyForm()); }}>Cancelar edicion</button>}
        </div>
      </section>

      {isLoading && <p className={styles.loading}>Cargando...</p>}
      {!isLoading && events.length === 0 && <p className={styles.empty}>No hay sorteos para este filtro.</p>}

      <section className={styles.eventGrid}>
        {events.map((event) => (
          <article className={styles.eventCard} key={event.eventId}>
            {event.imageUrl && <img src={event.imageUrl} alt="" loading="lazy" />}
            <div className={styles.eventBody}>
              <div className={styles.eventTitleRow}>
                <h3>{event.title}</h3>
                <span>{event.status}</span>
              </div>
              <p>{event.description}</p>
              <dl>
                <div><dt>Juego</dt><dd>{event.gameTitle}</dd></div>
                <div><dt>Plataforma</dt><dd>{event.platform}</dd></div>
                <div><dt>Lugares</dt><dd>{event.availableSlots}/{event.totalSlots}</dd></div>
                <div><dt>Ganador</dt><dd>{event.winnerUsername || 'Pendiente'}</dd></div>
              </dl>
              <div className={styles.cardActions}>
                <button onClick={() => { setEditingId(event.eventId); setForm(fromEvent(event)); }}>Editar</button>
                <button onClick={() => runAction(() => DropsService.publish(event.eventId), 'Sorteo publicado.')}>Publicar</button>
                <button onClick={() => setFinishEventId(event.eventId)}>Finalizar</button>
                {event.status === 'FINISHED' && event.winnerUserId && event.rewardDeliveryStatus !== 'SENT' && (
                  <button onClick={() => setRewardEventId(event.eventId)}>Enviar recompensa</button>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {rewardEventId && (
        <section className={styles.rewardPanel}>
          <h2>Enviar recompensa</h2>
          <input
            maxLength={50}
            value={rewardCode}
            onChange={(event) => setRewardCode(event.target.value)}
            placeholder="Codigo real del juego o suscripcion"
          />
          <button onClick={() => setIsRewardConfirmOpen(true)} disabled={isLoading}>Confirmar envio</button>
          <button onClick={() => setRewardEventId(null)}>Cancelar</button>
        </section>
      )}

      <ConfirmationModal
        isOpen={Boolean(finishEventId)}
        title="Finalizar sorteo"
        message="El sorteo dejara de admitir uniones y reclamos. Deseas continuar?"
        confirmLabel="Finalizar"
        variant="danger"
        onConfirm={() => {
          if (!finishEventId) return;
          const eventId = finishEventId;
          setFinishEventId(null);
          runAction(() => DropsService.finish(eventId), 'Sorteo finalizado.');
        }}
        onCancel={() => setFinishEventId(null)}
      />

      <ConfirmationModal
        isOpen={isRewardConfirmOpen}
        title="Enviar recompensa"
        message="Se enviara el codigo real por correo al ganador y no se mostrara nuevamente. Confirmas el envio?"
        confirmLabel="Enviar"
        onConfirm={() => {
          setIsRewardConfirmOpen(false);
          handleReward();
        }}
        onCancel={() => setIsRewardConfirmOpen(false)}
      />
    </div>
  );
};
