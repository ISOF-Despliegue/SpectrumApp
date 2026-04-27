import { useState } from 'react';
import styles from './Admin_ManageUsers.module.css';

type UserRow = {
  id: string;
  username: string;
};

const USERS: UserRow[] = [
  { id: '1', username: 'Aaa' },
  { id: '2', username: 'Bbbb' },
  { id: '3', username: 'Ccc' }
];

export const AdminManageUsers = () => {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('1');

  const filteredUsers = USERS.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleAccept = () => {
    const selectedUser = USERS.find((user) => user.id === selectedUserId);

    if (!selectedUser) {
      window.alert('Selecciona un usuario.');
      return;
    }

    window.alert(`Usuario seleccionado: ${selectedUser.username}`);
  };

  return (
    <article className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Administración de usuarios</h1>
      </header>

      <section className={styles.searchSection}>
        <p className={styles.sectionTitle}>Buscar por nombre</p>

        <input
          type="text"
          placeholder="Nombre de usuario"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={styles.searchInput}
        />
      </section>

      <section className={styles.tableSection}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th aria-label="Seleccionar usuario" />
              <th>Usuario</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className={styles.radioCell}>
                  <input
                    type="radio"
                    name="selectedUser"
                    checked={selectedUserId === user.id}
                    onChange={() => setSelectedUserId(user.id)}
                  />
                </td>
                <td>{user.username}</td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={2}>No se encontraron usuarios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <footer className={styles.footerActions}>
        <button type="button" className={styles.actionButton} onClick={handleAccept}>
  Aceptar
</button>
      </footer>
    </article>
  );
};
