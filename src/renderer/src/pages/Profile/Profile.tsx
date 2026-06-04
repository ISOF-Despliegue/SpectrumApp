import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Profile.module.css';
import { ProfileService, UserProfile, ProfileGame } from '../../services/profile.service';
import { AuthService, ROLES } from '../../services/auth.service';

import { ActionButton } from '../../components/ui/ActionButton';
import { EditableProfileImage } from '../../components/ui/ProfileComponents/EditableProfileImage';
import { ProfileSection } from '../../components/ui/ProfileComponents/ProfileSection';
import { InterestedGameCard } from '../../components/ui/ProfileComponents/InterestedGameCard';
import { GameSelectorModal } from '../../components/ui/ProfileComponents/GameSelectorModal';
import { InterestedGamesModal } from '../../components/ui/ProfileComponents/InterestedGamesModal';
import { PlatformSelectionModal } from '../../components/ui/ProfileComponents/PlatformSelectionModal';
import { PasswordChangeModal } from '../../components/ui/ProfileComponents/PasswordChangeModal';
import { ProfileClipsSection } from '@renderer/components/ui/ProfileComponents/ProfileClipsSection';
import { ClipUploadFlowModal } from '@renderer/components/ui/VideoComponents/VideoUploadModal/ClipUploadFlowModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { ReviewDetailModal } from '../../components/ui/ReviewDetailModal';
import { ReviewService } from '../../services/reviews.service';
import type { Review, ReviewFormValues, UploadedReviewAttachment } from '../../types/reviews.types';
import { FIELD_LIMITS } from '../../utilities/validationRules';
import { useToast } from '../../components/ui/Toast';
import { resolvePlatformIcon } from '../../components/ui/ProfileComponents/PlatformSelectionModal';
import { ProfileReviewPreviewCard } from '../../components/ui/ProfileComponents/ProfileReviewPreviewCard';
import { ReviewForm } from '../Games/GameReviews/ReviewForm';
import { validateReviewForm } from '../../utilities/reviewValidation';

/**
 * Main profile page component.
 * Manages user information, platform interests, gaming clips, and security settings.
 */
export const Profile: React.FC = () => {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const { userId } = useParams<{ userId: string }>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null; message: string | null }>({
    type: null,
    message: null
  });

  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isInterestedModalOpen, setIsInterestedModalOpen] = useState(false);
  const [isGameSelectorOpen, setIsGameSelectorOpen] = useState(false);
  const [isClipWizardOpen, setIsClipWizardOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isReviewBusy, setIsReviewBusy] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);

  const currentUser = AuthService.getCurrentUser();
  const isOwner = !userId;
  const isAdmin = currentUser?.role === ROLES.ADMIN;

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (isOwner) {
      return;
    }

    setIsEditing(false);
    setIsPasswordModalOpen(false);
    setIsPlatformModalOpen(false);
    setIsInterestedModalOpen(false);
    setIsGameSelectorOpen(false);
    setIsClipWizardOpen(false);
  }, [isOwner, userId]);

  /**
   * Fetches profile data from the server.
   */
  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setStatus({ type: null, message: null });
    try {
      const data = userId
        ? await ProfileService.getPublicProfile(userId)
        : await ProfileService.getMe();
      const userReviews = userId
        ? await ReviewService.getByUser(userId)
        : await ReviewService.getMyReviews();
      setProfile(data);
      setReviews(userReviews);
    } catch {
      toast.error(t('messages.fetchError'));
      setStatus({ type: 'error', message: t('messages.fetchError') });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Saves the profile changes to the backend.
   */
  const handleSaveProfile = async (): Promise<void> => {
    if (!profile) return;
    setStatus({ type: null, message: null });

    try {
      const updateData: UserProfile = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        profilePicture: profile.profilePicture,
        biography: profile.biography,
        interestedGames: profile.interestedGames,
        platforms: profile.platforms
      };

      await ProfileService.updateMyProfile(updateData);
      const refreshedProfile = await ProfileService.getMe();
      setProfile(refreshedProfile);

      setStatus({ type: 'success', message: t('messages.profileUpdated') });
      toast.success(t('messages.profileUpdated'));
      setIsEditing(false);

      setTimeout(() => setStatus({ type: null, message: null }), 3000);
    } catch {
      toast.error(t('messages.profileUpdateError'));
      setStatus({
        type: 'error',
        message: t('messages.profileUpdateError') || "Error al actualizar el perfil."
      });
    }
  };

  const handleDeleteGame = (gameId: string): void => {
    if (!profile) return;
    setProfile({
      ...profile,
      interestedGames: profile.interestedGames.filter(g => g.id !== gameId)
    });
  };

  const handleSelectGame = (game: ProfileGame): void => {
    if (!profile) return;
    if (profile.interestedGames.some(g => g.id === game.id)) return;

    setProfile({
      ...profile,
      interestedGames: [...profile.interestedGames, game]
    });
  };

  const handleAvatarUpdated = (newUrl: string): void => {
    if (!profile) return;
    setProfile({
      ...profile,
      profilePicture: newUrl
    });
  };

  const handleBlockProfile = async (): Promise<void> => {
    if (!userId) return;
    try {
      await ProfileService.blockUser(userId);
      toast.success(t('block.title'));
    } catch {
      toast.error(t('messages.profileUpdateError'));
    } finally {
      setIsBlockConfirmOpen(false);
    }
  };

  const uploadAttachment = async (file?: File | null): Promise<UploadedReviewAttachment | null> => {
    if (!file) {
      return null;
    }

    return ReviewService.uploadAttachment(file);
  };

  const handleEditReview = (review: Review): void => {
    setSelectedReview(null);
    setEditingReview(review);
  };

  const handleSubmitReviewEdit = async (values: ReviewFormValues): Promise<void> => {
    if (!editingReview) {
      return;
    }

    const validationMessage = validateReviewForm(values);
    if (validationMessage) {
      toast.warning(validationMessage);
      return;
    }

    try {
      setIsReviewBusy(true);
      const attachment = await uploadAttachment(values.file);
      await ReviewService.update(editingReview.id, {
        title: values.title.trim(),
        content: values.content.trim(),
        rating: values.rating,
        imageUrl: attachment?.url ?? editingReview.attachmentUrl ?? editingReview.imageUrl,
        mediaType: attachment?.mediaType ?? editingReview.attachmentType
      });
      toast.success(t('messages.reviewUpdated', { defaultValue: 'Reseña actualizada.' }));
      setEditingReview(null);
      await fetchData();
    } catch {
      toast.error(t('messages.profileUpdateError'));
    } finally {
      setIsReviewBusy(false);
    }
  };

  const handleDeleteReview = async (reviewId: string): Promise<void> => {
    try {
      setIsReviewBusy(true);
      await ReviewService.delete(reviewId);
      toast.success(t('messages.reviewDeleted', { defaultValue: 'Reseña eliminada.' }));
      setSelectedReview(null);
      await fetchData();
    } catch {
      toast.error(t('messages.profileUpdateError'));
      throw new Error('reviewDeleteFailed');
    } finally {
      setIsReviewBusy(false);
    }
  };

  if (loading) return <div className={styles.statusScreen}>{t('loading')}</div>;
  if (!profile) return <div className={styles.statusScreen}>{t('notFound')}</div>;

  return (
    <div className={styles.profileContainer}>
      {isAdmin && !isOwner && (
        <div className={styles.adminPath}>
          {t('adminPath')} {'>'} {profile.username}
        </div>
      )}

      {status.message && (
        <div className={`${styles.globalStatus} ${styles[status.type!]}`}>
          {status.message}
        </div>
      )}

      <div className={styles.profileLayout}>
        <aside className={styles.leftColumn}>
          <EditableProfileImage
            imageUrl={profile.profilePicture}
            isEditing={isEditing}
            onAvatarUpdated={handleAvatarUpdated}
          />

          <div className={styles.platformGroup}>
            <h3 className={styles.label}>{t('labels.platforms')}</h3>
            <div className={styles.platformLogos}>
              {profile.platforms.map(p => {
                const platformIcon = resolvePlatformIcon(p.name);
                return (
                  <div key={p.id} className={styles.logoWrapper} title={p.name}>
                    {platformIcon ? (
                      <img
                        src={platformIcon}
                        alt={p.name}
                        className={styles.platformIcon}
                      />
                    ) : (
                      <span className={styles.platformFallback}>{p.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                );
              })}
              {isEditing && (
                <button
                  className={styles.addPlatformBtn}
                  onClick={() => setIsPlatformModalOpen(true)}
                  title={t('actions.change')}
                >
                  +
                </button>
              )}
            </div>
          </div>
        </aside>

        <main className={styles.middleColumn}>
          <header className={styles.identityHeader}>
            {isEditing ? (
              <input
                className={styles.usernameInput}
                value={profile.username}
                maxLength={FIELD_LIMITS.username}
                onChange={(e) => setProfile({...profile, username: e.target.value})}
              />
            ) : (
              <h1 className={styles.usernameText}>{profile.username}</h1>
            )}
            <p className={styles.emailText}>{profile.email}</p>

            {isOwner && (
              <div className={styles.passwordTrigger}>
                <ActionButton variant="neutral" size="small" onClick={() => setIsPasswordModalOpen(true)}>
                  {t('actions.changePassword')}
                </ActionButton>
              </div>
            )}
          </header>

          <section className={styles.bioSection}>
            <h2 className={styles.sectionTitle}>{t('labels.description')}</h2>
            {isEditing ? (
              <textarea
                className={styles.bioEditor}
                placeholder={t('placeholders.bio')}
                value={profile.biography || ''}
                maxLength={FIELD_LIMITS.longText}
                onChange={(e) => setProfile({...profile, biography: e.target.value})}
              />
            ) : (
              <p className={styles.bioText}>{profile.biography || t('labels.noDescription')}</p>
            )}
          </section>

          <ProfileSection title={t('sections.reviews')} showSeeMore={true}>
            <div className={styles.reviewsList}>
              {reviews.map((review) => (
                <ProfileReviewPreviewCard
                  key={review.id}
                  gameCover={review.gameCoverUrl}
                  gameTitle={review.gameTitle}
                  username={review.username}
                  userImage={review.userProfileImageUrl || review.profilePicture}
                  content={review.content}
                  score={review.rating}
                  onClick={() => setSelectedReview(review)}
                />
              ))}
              {reviews.length === 0 && <p className={styles.emptyPlaceholder}>{t('placeholders.emptyReviews')}</p>}
            </div>
          </ProfileSection>
        </main>

        <aside className={styles.rightColumn}>
          <div className={styles.actionGroup}>
            {isOwner && !isEditing && (
              <ActionButton variant="neutral" onClick={() => setIsEditing(true)}>
                {t('actions.edit')}
              </ActionButton>
            )}

            {isOwner && isEditing && (
              <div className={styles.editActions}>
                <ActionButton variant="save" onClick={handleSaveProfile}>{t('actions.save')}</ActionButton>
                <ActionButton variant="cancel" onClick={() => {
                  setIsEditing(false);
                  fetchData();
                }}>{t('actions.cancel')}</ActionButton>
              </div>
            )}

            {!isOwner && !isAdmin && (
              <ActionButton variant="block" onClick={() => setIsBlockConfirmOpen(true)}>{t('actions.block')}</ActionButton>
            )}

            {isAdmin && !isOwner && (
              <div className={styles.adminButtons}>
                <ActionButton variant="deleteProfile">{t('actions.deleteProfile')}</ActionButton>
                <ActionButton variant="suspend">{t('actions.suspend')}</ActionButton>
              </div>
            )}
          </div>

          <ProfileSection
            title={t('sections.games')}
            showSeeMore={profile.interestedGames.length > 6}
            onSeeMore={() => setIsInterestedModalOpen(true)}
          >
            <div className={styles.gamesGrid}>
              {profile.interestedGames.slice(0, 6).map(game => (
                <InterestedGameCard
                  key={game.id}
                  id={game.id}
                  title={game.name}
                  imageUrl={game.imageUrl}
                  isEditable={isEditing}
                  onDelete={handleDeleteGame}
                />
              ))}

              {isEditing && (
                <button
                  className={styles.addGameBtn}
                  onClick={() => setIsInterestedModalOpen(true)}
                  title={t('selector.manageTitle')}
                >
                  +
                </button>
              )}
            </div>
          </ProfileSection>

          {/* Unified Clips preview section passing root listeners and refresh tokens */}
          <ProfileClipsSection
            profileUserId={userId || profile.id}
            isEditing={isEditing}
            isOwner={isOwner}
            onOpenUploadWizard={() => setIsClipWizardOpen(true)}
          />
        </aside>
      </div>

      <PlatformSelectionModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
        initialPlatforms={profile.platforms}
        onSave={(platforms) => {
          setProfile({ ...profile, platforms });
          setIsPlatformModalOpen(false);
        }}
      />

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <InterestedGamesModal
        isOpen={isInterestedModalOpen}
        onClose={() => setIsInterestedModalOpen(false)}
        games={profile.interestedGames}
        onDelete={handleDeleteGame}
        onOpenSelector={() => setIsGameSelectorOpen(true)}
      />

      <GameSelectorModal
        isOpen={isGameSelectorOpen}
        onClose={() => setIsGameSelectorOpen(false)}
        onSelect={handleSelectGame}
        alreadySelectedIds={profile.interestedGames.map(g => g.id)}
      />

      {isClipWizardOpen && (
        <ClipUploadFlowModal
          onClose={() => setIsClipWizardOpen(false)}
          onRefreshClips={fetchData}
        />
      )}

      {editingReview && (
        <div className={styles.reviewEditOverlay} role="presentation" onMouseDown={() => setEditingReview(null)}>
          <section
            className={styles.reviewEditDialog}
            role="dialog"
            aria-modal="true"
            aria-label={t('sections.reviews')}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ReviewForm
              initialReview={editingReview}
              isSubmitting={isReviewBusy}
              onCancel={() => setEditingReview(null)}
              onSubmit={handleSubmitReviewEdit}
            />
          </section>
        </div>
      )}

      <ReviewDetailModal
        review={selectedReview}
        isAuthenticated={AuthService.isAuthenticated()}
        isBusy={isReviewBusy}
        onEdit={handleEditReview}
        onDelete={handleDeleteReview}
        onClose={() => setSelectedReview(null)}
      />
      <ConfirmationModal
        isOpen={isBlockConfirmOpen}
        title={t('block.title')}
        message={t('block.message')}
        confirmLabel={t('block.confirm')}
        variant="danger"
        onConfirm={handleBlockProfile}
        onCancel={() => setIsBlockConfirmOpen(false)}
      />
    </div>
  );
};
