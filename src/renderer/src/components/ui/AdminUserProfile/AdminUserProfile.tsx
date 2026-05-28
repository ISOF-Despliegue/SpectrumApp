import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminUserProfile.module.css';
import { AdminUserDetailDto } from '../../../types/admin.types';
import { getUserDetail, deleteUser, toggleUserSuspension } from '../../../services/adminUsers.service';
import { ActionButton } from '../../../components/ui/ActionButton';
import { ProfileImageMedium } from '../../../components/ui/ProfileImageMedium';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';

interface AdminUserProfileProps {
  userId: string;
  onBack: () => void;
}

export const AdminUserProfile: React.FC<AdminUserProfileProps> = ({ userId, onBack }) => {
  const { t } = useTranslation('admin');
  const [profile, setProfile] = useState<AdminUserDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const data = await getUserDetail(userId);
      setProfile(data);
    } catch (error) {
      setMessage(t('manageUsers.errorLoad'));
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSuspension = async () => {
    if (!profile) return;
    try {
      await toggleUserSuspension(profile.id, !profile.isSuspended);
      setProfile({ ...profile, isSuspended: !profile.isSuspended });
    } catch (error: any) {
      setMessage(error.response?.data?.title || t('manageUsers.errorToggle'));
    }
  };

  const handleDeleteUser = async () => {
    if (!profile) return;
    try {
      await deleteUser(profile.id);
      onBack();
    } catch (error: any) {
      setMessage(error.response?.data?.title || 'No se pudo desactivar la cuenta del usuario.');
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  if (isLoading) return <p className={styles.loadingText}>{t('manageUsers.loading')}</p>;
  if (!profile) return null;

  return (
    <div className={styles.profileContainer}>
      <button className={styles.backButton} onClick={onBack}>
        {t('manageUsers.profile.back')}
      </button>

      {message && <p className={styles.loadingText}>{message}</p>}

      <div className={styles.headerCard}>
        <ProfileImageMedium
          imageUrl={profile.avatarUrl || undefined}
          onClick={() => {}}
        />
        <div className={styles.userInfo}>
          <h2>{profile.username}</h2>
          <p>{profile.email}</p>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            {t('manageUsers.profile.memberSince')}: {new Date(profile.createdAt).toLocaleDateString()}
          </p>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles.badgeRole}`}>{profile.role}</span>
            <span className={`${styles.badge} ${profile.isSuspended ? styles.badgeSuspended : styles.badgeActive}`}>
              {profile.isSuspended ? t('manageUsers.status.suspended') : t('manageUsers.status.active')}
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
            onClick={handleToggleSuspension}
          >
            {profile.isSuspended ? t('manageUsers.actions.reactivate') : t('manageUsers.actions.suspend')}
          </ActionButton>

          <ActionButton
            variant="deleteProfile"
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            {t('manageUsers.profile.actions.delete')}
          </ActionButton>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        title="Desactivar cuenta"
        message="Esta acción desactivará la cuenta del usuario. ¿Deseas continuar?"
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
