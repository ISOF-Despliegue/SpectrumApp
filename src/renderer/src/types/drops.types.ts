import { PagedResult } from './admin.types';

export type DropStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'JOIN_CLOSED'
  | 'REVEALED'
  | 'UPCOMING'
  | 'REGISTRATION_OPEN'
  | 'FULL'
  | 'REGISTRATION_CLOSED'
  | 'REVEAL_READY'
  | 'ACTIVE_JOIN'
  | 'REVEAL_ACTIVE'
  | 'FINISHED'
  | 'EXHAUSTED'
  | 'CANCELLED'
  | 'ARCHIVED'
  | 'EXPIRED';

export interface DropEvent {
  eventId: string;
  title: string;
  description: string;
  imageUrl: string;
  gameTitle: string;
  rawgGameId?: number | null;
  platform: string;
  startAt: string;
  joinDeadlineAt: string;
  closeAt?: string;
  revealAt: string;
  endAt: string;
  totalSlots: number;
  maxParticipants?: number;
  availableSlots: number;
  remainingSlots?: number;
  status: DropStatus;
  publicChallengeCode: string;
  currentUserJoined?: boolean;
  isJoined?: boolean;
  canJoin?: boolean;
  canClaim?: boolean;
  hasClaimed?: boolean;
  winnerUserId?: string | null;
  winnerUsername?: string | null;
  finishedAt?: string | null;
  visibleUntil?: string | null;
  rewardSentAt?: string | null;
  rewardDeliveryStatus: 'PENDING' | 'SENT' | 'FAILED';
  participantsCount: number;
  participantCount?: number;
  rewardCodesAvailable: number;
  rewardCodesTotal: number;
  claimedRewardCount?: number;
  keysAvailable: number;
  keysTotal: number;
  winners: DropWinner[];
}

export interface DropWinner {
  userId: string;
  username: string;
  claimedAt?: string | null;
  deliveryStatus: 'PENDING' | 'SENT' | 'FAILED';
}

export interface DropActionResult {
  success: boolean;
  eventId: string;
  message: string;
}

export interface ClaimDropResult {
  success: boolean;
  eventId: string;
  winnerUserId?: string | null;
  winnerUsername?: string | null;
  claimedAt?: string | null;
  message: string;
}

export interface DropEventPayload {
  title: string;
  description: string;
  imageUrl: string;
  gameTitle: string;
  rawgGameId?: number | null;
  platform: string;
  startAt: string;
  joinDeadlineAt: string;
  revealAt: string;
  endAt: string;
  totalSlots: number;
  publicChallengeCode?: string;
  accessKeys: string[];
}

export type DropEventPage = PagedResult<DropEvent>;
