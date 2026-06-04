import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ManageEvents.module.css';
import { DropsService } from '../../../services/drops.service';
import { DropEvent, DropEventPayload } from '../../../types/drops.types';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { Game, getGames } from '../../../services/games.service';
import { useToast } from '../../../components/ui/Toast';
import { FIELD_LIMITS } from '../../../utilities/validationRules';

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
    accessKeys: [],
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
  endAt: new Date(form.endAt).toISOString(),
  publicChallengeCode: '',
  accessKeys: form.accessKeys.map((code) => code.trim()).filter(Boolean)
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
  publicChallengeCode: '',
  accessKeys: [],
  publishNow: false
});

const canEditEvent = (event: DropEvent): boolean => {
  return event.status === 'UPCOMING' || event.status === 'SCHEDULED' || event.status === 'DRAFT';
};

export const AdminManageEvents = (): React.JSX.Element => {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [scope, setScope] = useState('CURRENT');
  const [events, setEvents] = useState<DropEvent[]>([]);
  const [form, setForm] = useState<DropEventPayload>(createEmptyForm);
  const [accessKeysText, setAccessKeysText] = useState('');
  const [gameSuggestions, setGameSuggestions] = useState<Game[]>([]);
  const [isSearchingGames, setIsSearchingGames] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [finishEventId, setFinishEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadEvents = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await DropsService.listAdmin(scope, 1, 20);
      setEvents(result.items);
    } catch {
      toast.error(t('manageEvents.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [scope]);

  useEffect(() => {
    const query = form.gameTitle.trim();
    if (query.length < 2) {
      setGameSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearchingGames(true);
      try {
        const response = await getGames(query, 1, 'name_asc');
        setGameSuggestions(response.items.slice(0, 6));
      } catch {
        setGameSuggestions([]);
      } finally {
        setIsSearchingGames(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [form.gameTitle]);

  const updateField = (field: keyof DropEventPayload, value: string | number | boolean): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectGame = (game: Game): void => {
    const rawgId = Number(game.id);
    setForm((current) => ({
      ...current,
      gameTitle: game.title,
      rawgGameId: Number.isFinite(rawgId) ? rawgId : null,
      imageUrl: game.imageUrl || game.coverImageUrl || ''
    }));
    setGameSuggestions([]);
  };

  const parseAccessKeys = (): string[] =>
    accessKeysText.split(/\r?\n|,/).map((code) => code.trim()).filter(Boolean);

  const validateForm = (): string | null => {
    const accessKeys = parseAccessKeys();
    if (!form.title.trim() || !form.gameTitle.trim() || !form.platform.trim()) {
      return t('manageEvents.validation.required');
    }
    if (!editingId && accessKeys.length === 0) {
      return t('manageEvents.validation.codesRequired');
    }
    if (accessKeys.some((code) => code.length > 50)) {
      return t('manageEvents.validation.codeLength');
    }
    if (new Set(accessKeys.map((code) => code.toLowerCase())).size !== accessKeys.length) {
      return t('manageEvents.validation.duplicateCodes');
    }
    if (Number(form.totalSlots) <= 0) {
      return t('manageEvents.validation.slots');
    }
    if (!(new Date(form.startAt) < new Date(form.joinDeadlineAt) &&
      new Date(form.joinDeadlineAt) <= new Date(form.revealAt) &&
      new Date(form.revealAt) < new Date(form.endAt))) {
      return t('manageEvents.validation.dates');
    }
    return null;
  };

  const handleSubmit = async (): Promise<void> => {
    const validation = validateForm();
    if (validation) {
      toast.warning(validation);
      return;
    }

    setIsLoading(true);
    const payload = toPayload({ ...form, accessKeys: parseAccessKeys() });
    try {
      if (editingId) {
        await DropsService.update(editingId, payload);
        toast.success(t('manageEvents.updated'));
      } else {
        await DropsService.create(payload);
        toast.success(t('manageEvents.created'));
      }
      setForm(createEmptyForm());
      setAccessKeysText('');
      setEditingId(null);
      await loadEvents();
    } catch {
      toast.error(t('manageEvents.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const runAction = async (action: () => Promise<unknown>, success: string): Promise<void> => {
    setIsLoading(true);
    try {
      await action();
      toast.success(success);
      await loadEvents();
    } catch {
      toast.error(t('manageEvents.actionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t('manageEvents.title')}</h1>
          <p>{t('manageEvents.subtitle')}</p>
        </div>
        <select className={styles.selectField} value={scope} onChange={(event) => setScope(event.target.value)}>
          <option value="CURRENT">{t('manageEvents.current')}</option>
          <option value="UPCOMING">{t('manageEvents.upcoming')}</option>
          <option value="PAST">{t('manageEvents.past')}</option>
          <option value="ALL">{t('manageEvents.all')}</option>
        </select>
      </header>

      <section className={styles.formPanel}>
        <h2>{editingId ? t('manageEvents.editTitle') : t('manageEvents.createTitle')}</h2>
        <div className={styles.formGrid}>
          <input placeholder={t('manageEvents.labels.title')} maxLength={FIELD_LIMITS.shortText} value={form.title} onChange={(event) => updateField('title', event.target.value)} />
          <div className={styles.autocomplete}>
            <input placeholder={t('manageEvents.labels.game')} maxLength={FIELD_LIMITS.shortText} value={form.gameTitle} onChange={(event) => updateField('gameTitle', event.target.value)} />
            {(gameSuggestions.length > 0 || isSearchingGames) && (
              <div className={styles.suggestions}>
                {isSearchingGames && <span>{t('manageEvents.searching')}</span>}
                {gameSuggestions.map((game) => (
                  <button key={game.id} type="button" onClick={() => selectGame(game)}>
                    {game.imageUrl && <img src={game.imageUrl} alt="" loading="lazy" />}
                    <span>{game.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <select className={styles.selectField} value={form.platform} onChange={(event) => updateField('platform', event.target.value)}>
            <option value="PC">PC</option>
            <option value="Xbox">Xbox</option>
            <option value="Nintendo">Nintendo</option>
            <option value="Celular">Celular</option>
          </select>
          <textarea placeholder={t('manageEvents.labels.description')} maxLength={FIELD_LIMITS.longText} value={form.description} onChange={(event) => updateField('description', event.target.value)} />
          <textarea placeholder={t('manageEvents.labels.codes')} maxLength={FIELD_LIMITS.dropCodes} value={accessKeysText} onChange={(event) => setAccessKeysText(event.target.value)} />
          <input aria-label={t('manageEvents.labels.totalSlots')} type="number" min="1" value={form.totalSlots} onChange={(event) => updateField('totalSlots', Number(event.target.value))} />
          <label>{t('manageEvents.labels.startAt')}<input type="datetime-local" value={form.startAt} onChange={(event) => updateField('startAt', event.target.value)} /></label>
          <label>{t('manageEvents.labels.joinDeadlineAt')}<input type="datetime-local" value={form.joinDeadlineAt} onChange={(event) => updateField('joinDeadlineAt', event.target.value)} /></label>
          <label>{t('manageEvents.labels.revealAt')}<input type="datetime-local" value={form.revealAt} onChange={(event) => updateField('revealAt', event.target.value)} /></label>
          <label>{t('manageEvents.labels.endAt')}<input type="datetime-local" value={form.endAt} onChange={(event) => updateField('endAt', event.target.value)} /></label>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={Boolean(form.publishNow)} onChange={(event) => updateField('publishNow', event.target.checked)} />
            {t('manageEvents.publishNow')}
          </label>
        </div>
        <div className={styles.actions}>
          <button onClick={handleSubmit} disabled={isLoading}>{editingId ? t('manageEvents.saveChanges') : t('manageEvents.create')}</button>
          {editingId && <button onClick={() => { setEditingId(null); setForm(createEmptyForm()); setAccessKeysText(''); }}>{t('manageEvents.cancelEdit')}</button>}
        </div>
      </section>

      {isLoading && <p className={styles.loading}>{t('manageEvents.loading')}</p>}
      {!isLoading && events.length === 0 && <p className={styles.empty}>{t('manageEvents.empty')}</p>}

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
                <div><dt>{t('manageEvents.labels.gameLabel')}</dt><dd>{event.gameTitle}</dd></div>
                <div><dt>{t('manageEvents.labels.platform')}</dt><dd>{event.platform}</dd></div>
                <div><dt>{t('manageEvents.labels.slots')}</dt><dd>{event.availableSlots}/{event.totalSlots}</dd></div>
                <div><dt>{t('manageEvents.labels.codesCount')}</dt><dd>{event.rewardCodesAvailable ?? event.keysAvailable}/{event.rewardCodesTotal ?? event.keysTotal}</dd></div>
                <div><dt>{t('manageEvents.labels.winners')}</dt><dd>{event.winners?.map((winner) => winner.username).join(', ') || event.winnerUsername || t('manageEvents.pending')}</dd></div>
              </dl>
              <div className={styles.cardActions}>
                <button
                  onClick={() => {
                    if (!canEditEvent(event)) {
                      toast.warning(t('manageEvents.notEditable'));
                      return;
                    }
                    setEditingId(event.eventId);
                    setForm(fromEvent(event));
                  }}
                  disabled={!canEditEvent(event)}
                  title={!canEditEvent(event) ? t('manageEvents.notEditable') : undefined}
                >
                  {t('manageEvents.edit')}
                </button>
                <button onClick={() => runAction(() => DropsService.publish(event.eventId), t('manageEvents.published'))}>{t('manageEvents.publish')}</button>
                <button onClick={() => setFinishEventId(event.eventId)}>{t('manageEvents.finish')}</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <ConfirmationModal
        isOpen={Boolean(finishEventId)}
        title={t('manageEvents.finishTitle')}
        message={t('manageEvents.finishMessage')}
        confirmLabel={t('manageEvents.finish')}
        variant="danger"
        onConfirm={() => {
          if (!finishEventId) return;
          const eventId = finishEventId;
          setFinishEventId(null);
          runAction(() => DropsService.finish(eventId), t('manageEvents.finished'));
        }}
        onCancel={() => setFinishEventId(null)}
      />
    </div>
  );
};
