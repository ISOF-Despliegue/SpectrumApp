import type { DropEvent, DropStatus } from '../../types/drops.types';

const JOIN_OPEN_STATUSES = new Set<DropStatus>(['REGISTRATION_OPEN', 'ACTIVE_JOIN']);
const REVEAL_STATUSES = new Set<DropStatus>(['REVEAL_READY', 'REVEAL_ACTIVE']);
const FINISHED_STATUSES = new Set<DropStatus>(['EXHAUSTED', 'FINISHED', 'EXPIRED', 'ARCHIVED']);

export const isJoinedToDrop = (drop: DropEvent): boolean => Boolean(drop.currentUserJoined ?? drop.isJoined);

export const getParticipantCount = (drop: DropEvent): number =>
  Math.max(0, drop.participantCount ?? drop.participantsCount ?? 0);

export const getTotalSlots = (drop: DropEvent): number => Math.max(0, drop.maxParticipants ?? drop.totalSlots ?? 0);

export const getRemainingSlots = (drop: DropEvent): number =>
  Math.max(0, drop.remainingSlots ?? drop.availableSlots ?? 0);

export const getRemainingCodes = (drop: DropEvent): number =>
  Math.max(0, drop.rewardCodesAvailable ?? drop.keysAvailable ?? 0);

export const getTotalCodes = (drop: DropEvent): number => Math.max(0, drop.rewardCodesTotal ?? drop.keysTotal ?? 0);

export const getClaimedCodes = (drop: DropEvent): number =>
  Math.max(0, drop.claimedRewardCount ?? getTotalCodes(drop) - getRemainingCodes(drop));

export const getWinnerNames = (drop: DropEvent): string[] => {
  const winners = drop.winners?.map(winner => winner.username).filter(Boolean) ?? [];
  return winners.length > 0 ? winners : drop.winnerUsername ? [drop.winnerUsername] : [];
};

export const formatClock = (value: string): string =>
  new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

export const percentage = (current: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
};

export const getDropPollingInterval = (status?: DropStatus): number | null => {
  switch (status) {
    case 'UPCOMING':
    case 'SCHEDULED':
    case 'DRAFT':
      return 30000;
    case 'REGISTRATION_OPEN':
    case 'ACTIVE_JOIN':
    case 'FULL':
      return 10000;
    case 'REGISTRATION_CLOSED':
    case 'JOIN_CLOSED':
      return 3000;
    case 'REVEAL_READY':
    case 'REVEAL_ACTIVE':
    case 'REVEALED':
      return 1000;
    case 'EXHAUSTED':
    case 'FINISHED':
    case 'EXPIRED':
    case 'ARCHIVED':
    case 'CANCELLED':
      return 60000;
    default:
      return 10000;
  }
};

export const canJoinDrop = (drop: DropEvent, isAdmin: boolean): boolean =>
  !isAdmin &&
  !isJoinedToDrop(drop) &&
  Boolean(drop.canJoin ?? (JOIN_OPEN_STATUSES.has(drop.status) && getRemainingSlots(drop) > 0));

export const canClaimDrop = (drop: DropEvent, now: number, isAdmin: boolean): boolean => {
  const revealAt = new Date(drop.revealAt).getTime();
  const endAt = new Date(drop.endAt).getTime();
  const claimWindowOpen = now >= revealAt && now <= endAt;

  return (
    !isAdmin &&
    Boolean(
      drop.canClaim ??
      (isJoinedToDrop(drop) &&
        !drop.hasClaimed &&
        claimWindowOpen &&
        getRemainingCodes(drop) > 0 &&
        (REVEAL_STATUSES.has(drop.status) || FINISHED_STATUSES.has(drop.status)))
    )
  );
};

export const getDropStatusMessageKey = (drop: DropEvent, now: number): string => {
  const closeAt = new Date(drop.closeAt ?? drop.joinDeadlineAt).getTime();
  const revealAt = new Date(drop.revealAt).getTime();
  const endAt = new Date(drop.endAt).getTime();

  if (getRemainingCodes(drop) <= 0 || drop.status === 'EXHAUSTED') return 'drops.state.exhausted';
  if (now <= closeAt && JOIN_OPEN_STATUSES.has(drop.status)) return 'drops.state.registrationOpen';
  if (now < revealAt || drop.status === 'REGISTRATION_CLOSED') return 'drops.state.waitingReveal';
  if (now <= endAt && getRemainingCodes(drop) > 0) return 'drops.state.revealActive';
  if (FINISHED_STATUSES.has(drop.status)) return 'drops.state.finished';
  return 'drops.state.upcoming';
};

export const getDropStatusMessageParams = (drop: DropEvent): Record<string, string> => ({
  closeTime: formatClock(drop.closeAt ?? drop.joinDeadlineAt),
  revealTime: formatClock(drop.revealAt)
});
