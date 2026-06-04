import { AuthService, ROLES } from '../services/auth.service';

interface ReviewVotePermissionInput {
  isOwnReview?: boolean;
  canVote?: boolean | null;
}

/**
 * Centralizes UI vote eligibility. Backend remains authoritative, but views use
 * this helper to avoid offering impossible actions such as self-vote/admin vote.
 */
export const getReviewVotePermission = ({ isOwnReview = false, canVote }: ReviewVotePermissionInput): {
  disabled: boolean;
  reason: 'admin' | 'ownReview' | 'contract' | null;
} => {
  const currentUser = AuthService.getCurrentUser();

  if (currentUser?.role === ROLES.ADMIN) {
    return { disabled: true, reason: 'admin' };
  }

  if (isOwnReview) {
    return { disabled: true, reason: 'ownReview' };
  }

  if (canVote === false) {
    return { disabled: true, reason: 'contract' };
  }

  return { disabled: false, reason: null };
};
