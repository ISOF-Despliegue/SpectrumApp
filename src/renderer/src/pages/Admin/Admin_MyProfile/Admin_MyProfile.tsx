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
  password: 'PasswordDemo123',
};

const maskValue = (value: string) => '*'.repeat(Math.max(value.length, 8));

export const AdminMyProfile = () => {
  const [isManageMode, setIsManageMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const visibleProfile = useMemo(
    () => ({
      ...INITIAL_PROFILE_DATA,
      phone: isManageMode ? INITIAL_PROFILE_DATA.phone : maskValue(INITIAL_PROFILE_DATA.phone),
      rfc: isManageMode ? INITIAL_PROFILE_DATA.rfc : maskValue(INITIAL_PROFILE_DATA.rfc),
      password: isManageMode ? INITIAL_PROFILE_DATA.password : maskValue(INITIAL_PROFILE_DATA.password),
    }),
    [isManageMode],
  );

  const handleEnableManageMode = () => {
    const isValidPassword = currentPassword === INITIAL_PROFILE_DATA.password;

    if (!isValidPassword) {
      window.alert('La contraseña actual no es correcta.');
      return;
    }

    setIsManageMode(true);
  };

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <div className={styles.avatar} aria-hidden="true" />

        <div className={styles.headerInfo}>
          <p className={styles.role}>{visibleProfile.role}</p>
          <h2 className={styles.name}>{visibleProfile.fullName}</h2>
        </div>

        <div className={styles.manageBox}>
          {!isManageMode ? (
            <>
              <label htmlFor="currentPassword">Contraseña actual</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <button type="button" onClick={handleEnableManageMode}>
                Administrar
              </button>
            </>
          ) : (
            <p>Modo administrar activo.</p>
          )}
        </div>
      </header>

      <section className={styles.grid}>
        <div>
          <h3>Correo</h3>
          <p>{visibleProfile.email}</p>
        </div>

        <div>
          <h3>Teléfono</h3>
          <p>{visibleProfile.phone}</p>
        </div>

        <div>
          <h3>Dirección</h3>
          <p>{visibleProfile.address}</p>
        </div>

        <div>
          <h3>RFC</h3>
          <p>{visibleProfile.rfc}</p>
        </div>

        <div>
          <h3>Contraseña</h3>
          <p>{visibleProfile.password}</p>
        </div>
      </section>
    </article>
  );
};
