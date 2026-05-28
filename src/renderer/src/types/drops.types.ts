import { PagedResult } from './admin.types';

export type DropStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'JOIN_CLOSED'
  | 'REVEALED'
  | 'UPCOMING'
  | 'ACTIVE_JOIN'
  | 'REVEAL_ACTIVE'
  | 'FINISHED'
  | 'EXHAUSTED'
  | 'CANCELLED';

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
  revealAt: string;
  endAt: string;
  totalSlots: number;
  availableSlots: number;
  status: DropStatus;
  publicChallengeCode: string;
  winnerUserId?: string | null;
  winnerUsername?: string | null;
  finishedAt?: string | null;
  rewardSentAt?: string | null;
  rewardDeliveryStatus: 'PENDING' | 'SENT';
  participantsCount: number;
  rewardCodesAvailable: number;
  rewardCodesTotal: number;
  keysAvailable: number;
  keysTotal: number;
  winners: DropWinner[];
}

export interface DropWinner {
  userId: string;
  username: string;
  claimedAt?: string | null;
  deliveryStatus: 'PENDING' | 'SENT';
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
  publishNow?: boolean;
}

export type DropEventPage = PagedResult<DropEvent>;
