import { PagedResult } from './admin.types';

export type DropStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'JOIN_CLOSED'
  | 'REVEALED'
  | 'FINISHED'
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
  publicChallengeCode: string;
  publishNow?: boolean;
}

export type DropEventPage = PagedResult<DropEvent>;
