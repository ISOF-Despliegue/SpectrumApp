import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { DropsService } from '../../services/drops.service';
import { DropEvent } from '../../types/drops.types';
import { getDropPollingInterval } from './dropEvent.utils';

interface DropEventPollingState {
  drop: DropEvent | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<DropEvent | null>;
  setDrop: Dispatch<SetStateAction<DropEvent | null>>;
}

export const useDropEventPolling = (eventId: string | undefined): DropEventPollingState => {
  const [drop, setDrop] = useState<DropEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const dropRef = useRef<DropEvent | null>(null);

  const refresh = useCallback(async (): Promise<DropEvent | null> => {
    if (!eventId || inFlightRef.current) return null;

    inFlightRef.current = true;
    setIsLoading(current => current || !dropRef.current);

    try {
      const updatedDrop = await DropsService.getPublic(eventId);
      dropRef.current = updatedDrop;
      setDrop(updatedDrop);
      setError(null);
      return updatedDrop;
    } catch {
      setError('dropLoadError');
      return null;
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    dropRef.current = null;
    setDrop(null);
    setError(null);
    if (!eventId) return;

    void refresh();
  }, [eventId, refresh]);

  useEffect(() => {
    if (!eventId) return;

    const interval = getDropPollingInterval(drop?.status);
    if (!interval) return;

    const intervalId = window.setInterval(() => {
      void refresh();
    }, interval);

    return () => window.clearInterval(intervalId);
  }, [drop?.status, eventId, refresh]);

  useEffect(() => {
    if (!eventId) return;

    const refreshWhenVisible = (): void => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };
    const refreshOnFocus = (): void => {
      void refresh();
    };

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [eventId, refresh]);

  return { drop, error, isLoading, refresh, setDrop };
};
