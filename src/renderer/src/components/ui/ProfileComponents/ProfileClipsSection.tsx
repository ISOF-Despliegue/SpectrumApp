import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';
import { ProfileSection } from './ProfileSection';
import { ManageClipsModal } from './ManageClipsModal';
import styles from '../../../../pages/Profile/profile.module.css';

interface ClipData {
  id: string;
  title: string;
  thumbnailUrl?: string;
  gameName?: string;
}

interface ProfileClipsSectionProps {
  profileUserId: string;
  isEditing: boolean;
  isOwner: boolean;
}

/**
 * ProfileClipsSection renders a clean, static, non-scrolling preview of video clips inside the profile sidebar.
 * It opens an immersive superimposed window for managing or adding content, mirroring the games feature behavior.
 */
export const ProfileClipsSection: React.FC<ProfileClipsSectionProps> = ({
  profileUserId,
  isEditing,
  isOwner
}) => {
  const { t } = useTranslation(['profile']);
  const [clipsList, setClipsList] = useState<ClipData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (profileUserId) {
      fetchClipsData();
    }
  }, [profileUserId]);

  const fetchClipsData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ClipData[]>(`/clips/user/${profileUserId}`);
      setClipsList(response.data);
    } catch (error) {
      console.error('Error fetching clips summary:', error);
      setClipsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // En el perfil solo se muestra un avance fijo de máximo 4 elementos, igual que tus juegos de interés
  const previewClips = clipsList.slice(0, 4);

  // Si no hay clips y no se está editando, mostramos la caja dashed limpia alineada con tus reseñas
  if (!isLoading && clipsList.length === 0 && !isEditing) {
    return (
      <ProfileSection title={t('profile:sections.clips')} showSeeMore={false}>
        <p className={styles.emptyPlaceholder} style={{ fontStyle: 'italic' }}>
          {t('profile:placeholders.emptyClips')}
        </p>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection
      title={t('profile:sections.clips')}
      showSeeMore={clipsList.length > 4 && !isEditing}
      onSeeMore={() => setIsManagerOpen(true)}
    >
      {/* Reutiliza tu contenedor nativo de cuadrícula de imágenes para evitar deformaciones */}
      <div className={styles.gamesGrid}>
        {previewClips.map((clip) => (
          <div
            key={clip.id}
            className={styles.logoWrapper}
            style={{ cursor: 'pointer', background: '#2d2d35', borderRadius: '8px', overflow: 'hidden' }}
            onClick={() => setIsManagerOpen(true)}
            title={clip.title}
          >
            {clip.thumbnailUrl ? (
              <img src={clip.thumbnailUrl} alt={clip.title} className={styles.platformIcon} />
            ) : (
              <div style={{ fontSize: '0.75rem', padding: '8px', textAlign: 'center', color: '#aaa' }}>
                {clip.title}
              </div>
            )}
          </div>
        ))}

        {isEditing && isOwner && (
          <button
            className={styles.addGameBtn}
            onClick={() => setIsManagerOpen(true)}
            title="Gestionar mis clips de video"
          >
            +
          </button>
        )}
      </div>

      <ManageClipsModal
        isOpen={isManagerOpen}
        profileUserId={profileUserId}
        isOwner={isOwner}
        onClose={() => {
          setIsManagerOpen(false);
          fetchClipsData();
        }}
      />
    </ProfileSection>
  );
};
