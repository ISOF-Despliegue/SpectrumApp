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
  const [isManageMode, setIsManageMode] = useState(false);
  const [isPasswordPromptVisible, setIsPasswordPromptVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [formData, setFormData] = useState(INITIAL_PROFILE_DATA);

  const visibleData = useMemo(
    () => ({
      ...formData,
      phone: isManageMode ? formData.phone : maskValue(formData.phone),
      address: isManageMode ? formData.address : maskValue(formData.address),
      rfc: isManageMode ? formData.rfc : maskValue(formData.rfc),
      password: isManageMode ? formData.password : maskValue(formData.password)
    }),
    [formData, isManageMode]
  );

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleOpenManageMode = () => {
    setIsPasswordPromptVisible(true);
  };

  const handleEnableManageMode = () => {
    const isValidPassword = currentPassword === INITIAL_PROFILE_DATA.password;

    if (!isValidPassword) {
      window.alert('La contraseña actual no es correcta.');
      return;
    }

    setIsManageMode(true);
    setIsPasswordPromptVisible(false);
    setCurrentPassword('');
  };

  return (
    <article className={styles.page}>
      <header className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar} aria-hidden="true" />
        </div>

        <div className={styles.profileInfo}>
          <p className={styles.roleBadge}>{visibleData.role}</p>
          <h2 className={styles.name}>{visibleData.fullName}</h2>
        </div>

        <div className={styles.actionsSection}>
          {!isManageMode && !isPasswordPromptVisible && (
            <button
              type="button"
              className={styles.editButton}
              onClick={handleOpenManageMode}
            >
              Editar perfil
            </button>
          )}

          {!isManageMode && isPasswordPromptVisible && (
            <div className={styles.passwordPrompt}>
              <label htmlFor="currentPassword" className={styles.promptLabel}>
                Contraseña actual
              </label>

              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className={styles.promptInput}
              />

              <div className={styles.promptActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setIsPasswordPromptVisible(false);
                    setCurrentPassword('');
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleEnableManageMode}
                >
                  Validar
                </button>
              </div>
            </div>
          )}

          {isManageMode && (
            <div className={styles.manageModeBox}>
              <p className={styles.manageModeTitle}>Modo edición activo</p>
              <p className={styles.manageModeText}>
                Ahora puedes visualizar y modificar los datos sensibles.
              </p>
            </div>
          )}
        </div>
      </header>

      <section className={styles.detailsGrid}>
        <div className={styles.infoBlock}>
          <h3 className={styles.infoTitle}>Correo</h3>
          {isManageMode ? (
            <input
              type="email"
              value={formData.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className={styles.input}
            />
          ) : (
            <p className={styles.infoValue}>{visibleData.email}</p>
          )}
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.infoTitle}>Teléfono</h3>
          {isManageMode ? (
            <input
              type="text"
              value={formData.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className={styles.input}
            />
          ) : (
            <p className={styles.infoValue}>{visibleData.phone}</p>
          )}
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.infoTitle}>Dirección</h3>
          {isManageMode ? (
            <input
              type="text"
              value={formData.address}
              onChange={(event) => handleChange('address', event.target.value)}
              className={styles.input}
            />
          ) : (
            <p className={styles.infoValue}>{visibleData.address}</p>
          )}
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.infoTitle}>RFC</h3>
          {isManageMode ? (
            <input
              type="text"
              value={formData.rfc}
              onChange={(event) => handleChange('rfc', event.target.value)}
              className={styles.input}
            />
          ) : (
            <p className={styles.infoValue}>{visibleData.rfc}</p>
          )}
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.infoTitle}>Contraseña</h3>
          {isManageMode ? (
            <input
              type="text"
              value={formData.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className={styles.input}
            />
          ) : (
            <p className={styles.infoValue}>{visibleData.password}</p>
          )}
        </div>
      </section>
    </article>
  );
};
