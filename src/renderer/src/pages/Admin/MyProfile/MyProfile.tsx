import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MyProfile.module.css';
import { AdminProfile, AdminProfileService, UpdateAdminProfilePayload } from '../../../services/adminProfile.service';
import { useToast } from '../../../components/ui/Toast';
import { EditableProfileImage } from '../../../components/ui/ProfileComponents/EditableProfileImage';

const toEditablePayload = (profile: AdminProfile): UpdateAdminProfilePayload => ({
  username: profile.username,
  firstName: profile.firstName,
  lastName: profile.lastName,
  phoneNumber: profile.phoneNumber,
  address: profile.address,
  profilePicture: profile.profilePicture ?? ''
});

export const AdminMyProfile = (): React.JSX.Element => {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [form, setForm] = useState<UpdateAdminProfilePayload | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const data = await AdminProfileService.getMe();
        setProfile(data);
        setForm(toEditablePayload(data));
      } catch {
        toast.error(t('adminProfile.errorLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [t, toast]);

  const updateField = (field: keyof UpdateAdminProfilePayload, value: string): void => {
    setForm((current) => current ? { ...current, [field]: value } : current);
  };

  const handleAvatarUpdated = (newUrl: string): void => {
    setProfile((current) => current ? { ...current, profilePicture: newUrl } : current);
    setForm((current) => current ? { ...current, profilePicture: newUrl } : current);
    toast.success(t('adminProfile.successSave'));
  };

  const cancelEdit = (): void => {
    if (profile) {
      setForm(toEditablePayload(profile));
    }
    setIsEditing(false);
  };

  const saveProfile = async (): Promise<void> => {
    if (!form) return;
    setIsSaving(true);
    try {
      const updated = await AdminProfileService.updateMe(form);
      setProfile(updated);
      setForm(toEditablePayload(updated));
      setIsEditing(false);
      toast.success(t('adminProfile.successSave'));
    } catch {
      toast.error(t('adminProfile.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className={styles.state}>{t('adminProfile.loading')}</p>;
  }

  if (!profile || !form) {
    return <p className={styles.state}>{t('adminProfile.errorLoad')}</p>;
  }

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.role}>{profile.role}</p>
          <h1>{t('adminProfile.title')}</h1>
          <p>{t('adminProfile.subtitle')}</p>
        </div>
        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button type="button" className={styles.secondaryButton} onClick={cancelEdit} disabled={isSaving}>
                {t('adminProfile.cancel')}
              </button>
              <button type="button" className={styles.primaryButton} onClick={saveProfile} disabled={isSaving}>
                {t('adminProfile.save')}
              </button>
            </>
          ) : (
            <button type="button" className={styles.primaryButton} onClick={() => setIsEditing(true)}>
              {t('adminProfile.edit')}
            </button>
          )}
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.avatar}>
          <EditableProfileImage
            imageUrl={form.profilePicture || profile.profilePicture}
            isEditing={isEditing}
            onAvatarUpdated={handleAvatarUpdated}
          />
        </div>
        <div className={styles.formGrid}>
          <label>
            {t('adminProfile.fields.username')}
            <input value={form.username} disabled={!isEditing} onChange={(event) => updateField('username', event.target.value)} />
          </label>
          <label>
            {t('adminProfile.fields.email')}
            <input value={profile.email} disabled title={t('adminProfile.readOnly')} />
          </label>
          <label>
            {t('adminProfile.fields.firstName')}
            <input value={form.firstName} disabled={!isEditing} onChange={(event) => updateField('firstName', event.target.value)} />
          </label>
          <label>
            {t('adminProfile.fields.lastName')}
            <input value={form.lastName} disabled={!isEditing} onChange={(event) => updateField('lastName', event.target.value)} />
          </label>
          <label>
            {t('adminProfile.fields.phoneNumber')}
            <input value={form.phoneNumber} disabled={!isEditing} onChange={(event) => updateField('phoneNumber', event.target.value)} />
          </label>
          <label>
            {t('adminProfile.fields.rfc')}
            <input value={profile.rfc} disabled title={t('adminProfile.readOnly')} />
          </label>
          <label className={styles.wide}>
            {t('adminProfile.fields.address')}
            <input value={form.address} disabled={!isEditing} onChange={(event) => updateField('address', event.target.value)} />
          </label>
        </div>
      </section>
    </article>
  );
};
