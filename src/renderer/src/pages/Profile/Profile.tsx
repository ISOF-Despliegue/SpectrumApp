import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './profile.module.css';
import { ProfileService, UserProfile, ProfileGame } from '../../services/profile.service';

import { ActionButton } from '../../components/ui/ActionButton';
import { EditableProfileImage } from '../../components/ui/ProfileComponents/EditableProfileImage';
import { ProfileSection } from '../../components/ui/ProfileComponents/ProfileSection';
import { InterestedGameCard } from '../../components/ui/ProfileComponents/InterestedGameCard';
import { GameSelectorModal } from '../../components/ui/ProfileComponents/GameSelectorModal';
import { InterestedGamesModal } from '../../components/ui/ProfileComponents/InterestedGamesModal';
import { PlatformSelectionModal } from '../../components/ui/ProfileComponents/PlatformSelectionModal';
import { PasswordChangeModal } from '../../components/ui/ProfileComponents/PasswordChangeModal';

import nintendoLogo from '../../assets/images/platforms/nintendoLogo.png';
import pcLogo from '../../assets/images/platforms/pcgamerLogo.png';
import phoneLogo from '../../assets/images/platforms/phoneLogo.png';
import playstationLogo from '../../assets/images/platforms/playstationLogo.png';
import xboxLogo from '../../assets/images/platforms/xboxLogo.png';

const PLATFORM_LOGOS: Record<string, string> = {
  'Nintendo': nintendoLogo,
  'PC': pcLogo,
  'Phone': phoneLogo,
  'PlayStation': playstationLogo,
  'Xbox': xboxLogo
};

/// <summary>
/// Main profile page component.
/// Manages user information, platform interests, and security settings.
/// </summary>
export const Profile: React.FC = () => {
  const { t } = useTranslation('profile');
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

  const loggedInUserId = "id-actual-del-usuario";
  const userRole: "user" | "admin" = "user";
  const isOwner = !userId || userId === loggedInUserId;
  const isAdmin = (userRole as string) === 'admin';

  useEffect(() => {
    fetchData();
  }, [userId]);

  /// <summary>
  /// Fetches profile data from the server.
  /// </summary>
  const fetchData = async () => {
    setLoading(true);
    setStatus({ type: null, message: null });
    try {
      const data = await ProfileService.getMe();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setStatus({ type: 'error', message: t('messages.fetchError') });
    } finally {
      setLoading(false);
    }
  };

  /// <summary>
  /// Saves the profile changes to the backend.
  /// Maps the local state to the DTO expected by the server to avoid 400 Bad Request.
  /// </summary>
  const handleSaveProfile = async () => {
    if (!profile) return;
    setStatus({ type: null, message: null });

    try {
      const updateData = {
        username: profile.username,
        email: profile.email,
        profilePicture: profile.profilePicture,
        biography: profile.biography,
        interestedGames: profile.interestedGames,
        platforms: profile.platforms
      };

      await ProfileService.updateMyProfile(updateData as any);

      setStatus({ type: 'success', message: t('messages.profileUpdated') });
      setIsEditing(false);

      setTimeout(() => setStatus({ type: null, message: null }), 3000);
    } catch (error) {
      console.error("Update error:", error);
      setStatus({
        type: 'error',
        message: t('messages.profileUpdateError') || "Error al actualizar el perfil."
      });
    }
  };

  /// <summary>
  /// Removes a game from the local profile state.
  /// </summary>
  const handleDeleteGame = (gameId: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      interestedGames: profile.interestedGames.filter(g => g.id !== gameId)
    });
  };

  /// <summary>
  /// Adds a new game to the local profile state including its image.
  /// </summary>
  const handleSelectGame = (game: ProfileGame) => {
    if (!profile) return;
    if (profile.interestedGames.some(g => g.id === game.id)) return;

    setProfile({
      ...profile,
      interestedGames: [...profile.interestedGames, game]
    });
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

      {/* Mensaje de estado mejorado (flotante según el nuevo CSS) */}
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
            onEditClick={() => console.log("Lógica AWS")}
          />

          <div className={styles.platformGroup}>
            <h3 className={styles.label}>{t('labels.platforms')}</h3>
            <div className={styles.platformLogos}>
              {profile.platforms.map(p => (
                <div key={p.id} className={styles.logoWrapper} title={p.name}>
                  <img
                    src={PLATFORM_LOGOS[p.name]}
                    alt={p.name}
                    className={styles.platformIcon}
                  />
                </div>
              ))}
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
                onChange={(e) => setProfile({...profile, username: e.target.value})}
              />
            ) : (
              <h1 className={styles.usernameText}>{profile.username}</h1>
            )}
            <p className={styles.emailText}>{profile.email}</p>

            {isEditing && (
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
                onChange={(e) => setProfile({...profile, biography: e.target.value})}
              />
            ) : (
              <p className={styles.bioText}>{profile.biography || t('labels.noDescription')}</p>
            )}
          </section>

          <ProfileSection title={t('sections.reviews')} showSeeMore={true}>
            <p className={styles.emptyPlaceholder}>{t('placeholders.emptyReviews')}</p>
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
              <ActionButton variant="block">{t('actions.block')}</ActionButton>
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

          <ProfileSection title={t('sections.clips')} showSeeMore={true}>
            <p className={styles.emptyPlaceholder}>{t('placeholders.emptyClips')}</p>
          </ProfileSection>
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
    </div>
  );
};
