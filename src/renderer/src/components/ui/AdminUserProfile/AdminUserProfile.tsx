import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminUserProfile.module.css';
import { AdminUserDetailDto } from '../../../types/admin.types';
import { getUserDetail, deleteUser, reactivateUser, toggleUserBan, toggleUserSuspension } from '../../../services/adminUsers.service';
import { ActionButton } from '../../../components/ui/ActionButton';
import { ProfileImageMedium } from '../../../components/ui/ProfileImageMedium';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { ReviewCardPre } from '../ReviewCards/ReviewCardPre';
import { ReviewDetailModal } from '../ReviewDetailModal';
import { ProfileClipsSection } from '../ProfileComponents/ProfileClipsSection';
import { ReviewService } from '../../../services/reviews.service';
import { useToast } from '../Toast';
import type { Review } from '../../../types/reviews.types';
import { asApiError } from '../../../utilities/apiError';

interface AdminUserProfileProps {
  userId: string;
  onBack: () => void;
}

export const AdminUserProfile: React.FC<AdminUserProfileProps> = ({ userId, onBack }) => {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [profile, setProfile] = useState<AdminUserDetailDto | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSuspendConfirmOpen, setIsSuspendConfirmOpen] = useState(false);
  const [isBanConfirmOpen, setIsBanConfirmOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async (): Promise<void> => {
    try {
      const [data, userReviews] = await Promise.all([
        getUserDetail(userId),
        ReviewService.getByUser(userId)
      ]);
      setProfile(data);
      setReviews(userReviews);
    } catch {
      toast.error(t('manageUsers.errorLoad'));
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSuspension = async (): Promise<void> => {
    if (!profile) return;
    try {
      if (profile.isSuspended || profile.isDeleted || profile.isBanned) {
        await reactivateUser(profile.id);
        setProfile({ ...profile, isSuspended: false, isBanned: false, isDeleted: false, status: 'ACTIVE' });
        toast.success(t('manageUsers.statusChanged'));
      } else {
        await toggleUserSuspension(profile.id, true);
        setProfile({ ...profile, isSuspended: true, status: 'SUSPENDED' });
        toast.success(t('manageUsers.statusChanged'));
      }
    } catch (error: unknown) {
      const apiError = asApiError(error);
      toast.error(apiError.response?.data?.title || t('manageUsers.errorToggle'));
    } finally {
      setIsSuspendConfirmOpen(false);
    }
  };

  const handleToggleBan = async (): Promise<void> => {
    if (!profile) return;
    try {
      await toggleUserBan(profile.id, !profile.isBanned);
      setProfile({
        ...profile,
        isBanned: !profile.isBanned,
        isSuspended: !profile.isBanned,
        status: !profile.isBanned ? 'BANNED' : 'ACTIVE'
      });
      toast.success(t('manageUsers.statusChanged'));
    } catch (error: unknown) {
      const apiError = asApiError(error);
      toast.error(apiError.response?.data?.title || t('manageUsers.errorToggle'));
    } finally {
      setIsBanConfirmOpen(false);
    }
  };

  const handleDeleteUser = async (): Promise<void> => {
    if (!profile) return;
    try {
      await deleteUser(profile.id);
      toast.success('Usuario eliminado correctamente.');
      onBack();
    } catch (error: unknown) {
      const apiError = asApiError(error);
      toast.error(apiError.response?.data?.title || t('manageUsers.errorToggle'));
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  if (isLoading) return <p className={styles.loadingText}>{t('manageUsers.loading')}</p>;
  if (!profile) return null;
  const statusKey = (profile.status || (profile.isDeleted ? 'DELETED' : profile.isBanned ? 'BANNED' : profile.isSuspended ? 'SUSPENDED' : 'ACTIVE')).toLowerCase();

  return (
    <div className={styles.profileContainer}>
      <button className={styles.backButton} onClick={onBack}>
        {t('manageUsers.profile.back')}
      </button>

      <div className={styles.headerCard}>
        <ProfileImageMedium
          imageUrl={profile.avatarUrl || undefined}
          onClick={() => {}}
        />
        <div className={styles.userInfo}>
          <h2>{profile.username}</h2>
          <p>{profile.email}</p>
          <p className={styles.memberSince}>
            {t('manageUsers.profile.memberSince')}: {new Date(profile.createdAt).toLocaleDateString()}
          </p>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles.badgeRole}`}>{profile.role}</span>
            <span className={`${styles.badge} ${styles[`badge${statusKey}`]}`}>
              {t(`manageUsers.status.${statusKey}`)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <h3 className={styles.metricValue}>{profile.totalReviews}</h3>
          <p className={styles.metricLabel}>{t('manageUsers.profile.metrics.reviews')}</p>
        </div>
        <div className={styles.metricCard}>
          <h3 className={styles.metricValue}>{profile.totalClips}</h3>
          <p className={styles.metricLabel}>{t('manageUsers.profile.metrics.clips')}</p>
        </div>
      </div>

      {profile.role !== 'ADMIN' && (
        <div className={styles.actionsSection}>
          <ActionButton
            variant={profile.isSuspended ? 'change' : 'suspend'}
            onClick={() => setIsSuspendConfirmOpen(true)}
          >
            {profile.isSuspended || profile.isDeleted || profile.isBanned ? t('manageUsers.actions.reactivate') : t('manageUsers.actions.suspend')}
          </ActionButton>

          {!profile.isDeleted && (
            <ActionButton
              variant={profile.isBanned ? 'change' : 'delete'}
              onClick={() => profile.isBanned ? handleToggleBan() : setIsBanConfirmOpen(true)}
            >
              {profile.isBanned ? t('manageUsers.actions.unban') : t('manageUsers.actions.ban')}
            </ActionButton>
          )}

          <ActionButton
            variant="deleteProfile"
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            {t('manageUsers.profile.actions.delete')}
          </ActionButton>
        </div>
      )}

      <section className={styles.contentSection}>
        <h3>{t('manageUsers.profile.metrics.reviews')}</h3>
        <div className={styles.reviewList}>
          {reviews.map((review) => (
            <ReviewCardPre
              key={review.id}
              reviewId={review.id}
              gameCover={review.gameCoverUrl}
              username={review.username}
              userImage={review.userProfileImageUrl || review.profilePicture}
              reviewTitle={review.title}
              reviewContent={review.content}
              reviewDate={new Date(review.createdAt).toLocaleDateString()}
              reviewImage={review.attachmentType === 'image' ? review.attachmentUrl || review.imageUrl : undefined}
              likes={review.likesCount}
              dislikes={review.dislikesCount}
              score={review.rating}
              isOwnReview={review.isOwnReview}
              userVote={review.userVote ?? review.currentUserVote ?? review.myVote ?? null}
              onClick={() => setSelectedReview(review)}
            />
          ))}
        </div>
      </section>

      <section className={styles.contentSection}>
        <h3>{t('manageUsers.profile.metrics.clips')}</h3>
        <ProfileClipsSection
          profileUserId={profile.id}
          isEditing={false}
          isOwner={false}
          onOpenUploadWizard={() => {}}
        />
      </section>

      <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />

      <ConfirmationModal
        isOpen={isSuspendConfirmOpen}
        title={profile.isSuspended || profile.isDeleted || profile.isBanned ? t('manageUsers.confirmReactivateTitle') : t('manageUsers.confirmSuspendTitle')}
        message={profile.isSuspended || profile.isDeleted || profile.isBanned ? t('manageUsers.confirmReactivateMessage') : t('manageUsers.confirmSuspendMessage')}
        confirmLabel={profile.isSuspended || profile.isDeleted || profile.isBanned ? t('manageUsers.actions.reactivate') : t('manageUsers.actions.suspend')}
        variant={profile.isSuspended || profile.isDeleted || profile.isBanned ? 'default' : 'danger'}
        onConfirm={handleToggleSuspension}
        onCancel={() => setIsSuspendConfirmOpen(false)}
      />

      <ConfirmationModal
        isOpen={isBanConfirmOpen}
        title={t('manageUsers.actions.ban')}
        message={t('manageUsers.confirmSuspendMessage')}
        confirmLabel={t('manageUsers.actions.ban')}
        variant="danger"
        onConfirm={handleToggleBan}
        onCancel={() => setIsBanConfirmOpen(false)}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        title={t('manageUsers.profile.actions.delete')}
        message={t('manageUsers.profile.actions.confirmDelete')}
        confirmLabel={t('manageUsers.profile.actions.delete')}
        variant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
