import { useMemo, useState } from 'react';
import styles from './Admin_MyProfile.module.css';

type ProfileData = {
  role: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  rfc: string;
  password: string;
};

const INITIAL_PROFILE_DATA: ProfileData = {
  role: 'Admin',
  fullName: 'Abraham Cano Ramírez',
  email: 'canoabraham172@gmail.com',
  phone: '2289824567',
  address: 'Av. Xalapa, Ferrer Guardia, #5, Xalapa',
  rfc: 'AJBS75VCA8TBA',
  password: 'PasswordDemo123'
};

const maskValue = (value: string) => '*'.repeat(Math.max(value.length, 8));

export const AdminMyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [formData, setFormData] = useState(INITIAL_PROFILE_DATA);

  const visibleData = useMemo(
    () => ({
      ...formData,
      phone: isEditing ? formData.phone : maskValue(formData.phone),
      address: isEditing ? formData.address : maskValue(formData.address),
      rfc: isEditing ? formData.rfc : maskValue(formData.rfc),
      password: isEditing ? formData.password : maskValue(formData.password)
    }),
    [formData, isEditing]
  );

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleValidatePassword = () => {
    if (currentPassword !== INITIAL_PROFILE_DATA.password) {
      window.alert('La contraseña actual no es correcta.');
      return;
    }

    setIsEditing(true);
    setShowPasswordValidation(false);
    setCurrentPassword('');
  };

  return (
    <article className={styles.page}>
      <header className={styles.profileHeader}>
        <div className={styles.avatar} aria-hidden="true" />

        <div className={styles.profileIdentity}>
          <p className={styles.roleBadge}>{visibleData.role}</p>
          <h1>{visibleData.fullName}</h1>
        </div>

        <div className={styles.editArea}>
          {!isEditing && !showPasswordValidation && (
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setShowPasswordValidation(true)}
            >
              Editar perfil
            </button>
          )}

          {!isEditing && showPasswordValidation && (
            <div className={styles.passwordBox}>
              <p>Contraseña actual</p>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />

              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setShowPasswordValidation(false);
                    setCurrentPassword('');
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={handleValidatePassword}
                >
                  Validar
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className={styles.dataGrid}>
        <div className={styles.dataItem}>
          <p className={styles.dataLabel}>Correo</p>
          {isEditing ? (
            <input
              value={formData.email}
              onChange={(event) => handleChange('email', event.target.value)}
            />
          ) : (
            <p>{visibleData.email}</p>
          )}
        </div>

        <div className={styles.dataItem}>
          <p className={styles.dataLabel}>Teléfono</p>
          {isEditing ? (
            <input
              value={formData.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
            />
          ) : (
            <p>{visibleData.phone}</p>
          )}
        </div>

        <div className={styles.dataItem}>
          <p className={styles.dataLabel}>Dirección</p>
          {isEditing ? (
            <input
              value={formData.address}
              onChange={(event) => handleChange('address', event.target.value)}
            />
          ) : (
            <p>{visibleData.address}</p>
          )}
        </div>

        <div className={styles.dataItem}>
          <p className={styles.dataLabel}>RFC</p>
          {isEditing ? (
            <input
              value={formData.rfc}
              onChange={(event) => handleChange('rfc', event.target.value)}
            />
          ) : (
            <p>{visibleData.rfc}</p>
          )}
        </div>

        <div className={styles.dataItem}>
          <p className={styles.dataLabel}>Contraseña</p>
          {isEditing ? (
            <input
              type="password"
              value={formData.password}
              onChange={(event) => handleChange('password', event.target.value)}
            />
          ) : (
            <p>{visibleData.password}</p>
          )}
        </div>
      </section>
    </article>
  );
};
