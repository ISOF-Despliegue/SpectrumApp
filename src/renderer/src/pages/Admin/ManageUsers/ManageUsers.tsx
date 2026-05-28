import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ManageUsers.module.css';
import { getModeratedUsers, toggleUserSuspension } from '../../../services/adminUsers.service';
import { UserModerationDto } from '../../../types/admin.types';
import { Input } from '../../../components/ui/Input';
import { ActionButton } from '../../../components/ui/ActionButton';
import { Pagination } from '../../../components/ui/Pagination';
import { AdminUserProfile } from '../../../components/ui/AdminUserProfile';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useToast } from '../../../components/ui/Toast';

export const ManageUsers = () => {
  const { t } = useTranslation('admin');
  const toast = useToast();

  const [users, setUsers] = useState<UserModerationDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingSuspension, setPendingSuspension] = useState<UserModerationDto | null>(null);

  const PAGE_SIZE = 10;

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getModeratedUsers(page, PAGE_SIZE, searchTerm);
      setUsers(result.items);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      const message = err.response?.data?.title || t('manageUsers.errorLoad');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearchClick = () => {
    setPage(1);
    fetchUsers();
  };

  const handleToggleSuspension = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserSuspension(userId, !currentStatus);
      setUsers(users.map(u =>
        u.id === userId ? { ...u, isSuspended: !currentStatus } : u
      ));
      toast.success(t('manageUsers.statusChanged'));
    } catch (err: any) {
      toast.error(err.response?.data?.title || t('manageUsers.errorToggle'));
    } finally {
      setPendingSuspension(null);
    }
  };

  if (selectedUserId) {
    return (
      <div className={styles.container}>
         <AdminUserProfile
            userId={selectedUserId}
            onBack={() => {
              setSelectedUserId(null);
              fetchUsers();
            }}
         />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>{t('manageUsers.title')}</h1>

      <div className={styles.searchBar}>
        <Input
          type="text"
          placeholder={t('manageUsers.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ActionButton variant="neutral" onClick={handleSearchClick}>
          {t('manageUsers.searchButton')}
        </ActionButton>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {isLoading ? (
        <p className={styles.loadingText}>{t('manageUsers.loading')}</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>{t('manageUsers.table.user')}</th>
                <th>{t('manageUsers.table.email')}</th>
                <th>{t('manageUsers.table.role')}</th>
                <th>{t('manageUsers.table.status')}</th>
                <th>{t('manageUsers.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={user.isSuspended ? styles.statusSuspended : styles.statusActive}>
                      {user.isSuspended ? t('manageUsers.status.suspended') : t('manageUsers.status.active')}
                    </span>
                  </td>
                  <td>
                    {user.role !== 'ADMIN' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ActionButton
                          variant="neutral"
                          size="small"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          {t('manageUsers.actions.viewProfile')}
                        </ActionButton>

                        <ActionButton
                          variant={user.isSuspended ? 'change' : 'suspend'}
                          size="small"
                          onClick={() => setPendingSuspension(user)}
                        >
                          {user.isSuspended ? t('manageUsers.actions.reactivate') : t('manageUsers.actions.suspend')}
                        </ActionButton>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && <p className={styles.emptyText}>{t('manageUsers.empty')}</p>}
        </div>
      )}

      {totalCount > PAGE_SIZE && (
        <div className={styles.paginationWrapper}>
          <Pagination
            currentPage={page}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
      <ConfirmationModal
        isOpen={Boolean(pendingSuspension)}
        title={pendingSuspension?.isSuspended ? t('manageUsers.confirmReactivateTitle') : t('manageUsers.confirmSuspendTitle')}
        message={pendingSuspension?.isSuspended ? t('manageUsers.confirmReactivateMessage') : t('manageUsers.confirmSuspendMessage')}
        confirmLabel={pendingSuspension?.isSuspended ? t('manageUsers.actions.reactivate') : t('manageUsers.actions.suspend')}
        variant={pendingSuspension?.isSuspended ? 'default' : 'danger'}
        onConfirm={() => pendingSuspension && handleToggleSuspension(pendingSuspension.id, pendingSuspension.isSuspended)}
        onCancel={() => setPendingSuspension(null)}
      />
    </div>
  );
};
