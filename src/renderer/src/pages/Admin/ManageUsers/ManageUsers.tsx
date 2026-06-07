import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ManageUsers.module.css';
import { getModeratedUsers, reactivateUser, toggleUserBan, toggleUserSuspension } from '../../../services/adminUsers.service';
import { UserModerationDto } from '../../../types/admin.types';
import { Input } from '../../../components/ui/Input';
import { ActionButton } from '../../../components/ui/ActionButton';
import { Pagination } from '../../../components/ui/Pagination';
import { AdminUserProfile } from '../../../components/ui/AdminUserProfile';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useToast } from '../../../components/ui/Toast';
import { asApiError } from '../../../utilities/apiError';

export const ManageUsers = (): React.JSX.Element => {
  const { t } = useTranslation('admin');
  const toast = useToast();

  const [users, setUsers] = useState<UserModerationDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingSuspension, setPendingSuspension] = useState<UserModerationDto | null>(null);
  const [pendingBan, setPendingBan] = useState<UserModerationDto | null>(null);

  const PAGE_SIZE = 10;

  const fetchUsers = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getModeratedUsers(page, PAGE_SIZE, searchTerm, statusFilter || undefined);
      setUsers(result.items);
      setTotalCount(result.totalCount);
    } catch (err: unknown) {
      const apiError = asApiError(err);
      const message = apiError.response?.data?.title || t('manageUsers.errorLoad');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const handleSearchClick = (): void => {
    setPage(1);
    fetchUsers();
  };

  const handleToggleSuspension = async (userId: string, currentStatus: boolean): Promise<void> => {
    try {
      await toggleUserSuspension(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId
        ? { ...u, isSuspended: !currentStatus, status: !currentStatus ? 'SUSPENDED' : 'ACTIVE' }
        : u
      ));
      toast.success(currentStatus ? 'Usuario reactivado correctamente.' : 'Usuario desactivado correctamente.');
    } catch (err: unknown) {
      const apiError = asApiError(err);
      toast.error(apiError.response?.data?.title || t('manageUsers.errorToggle'));
    } finally {
      setPendingSuspension(null);
    }
  };

  const handleToggleBan = async (userId: string, currentStatus: boolean): Promise<void> => {
    try {
      await toggleUserBan(userId, !currentStatus);
      setUsers(users.map(user => user.id === userId
        ? {
            ...user,
            isBanned: !currentStatus,
            isSuspended: !currentStatus,
            status: !currentStatus ? 'BANNED' : 'ACTIVE'
          }
        : user
      ));
      toast.success(t('manageUsers.statusChanged'));
    } catch (err: unknown) {
      const apiError = asApiError(err);
      toast.error(apiError.response?.data?.title || t('manageUsers.errorToggle'));
    } finally {
      setPendingBan(null);
    }
  };

  const handleReactivate = async (userId: string): Promise<void> => {
    try {
      await reactivateUser(userId);
      setUsers(users.map(user => user.id === userId
        ? { ...user, isSuspended: false, isBanned: false, isDeleted: false, status: 'ACTIVE' }
        : user
      ));
      toast.success(t('manageUsers.statusChanged'));
    } catch (err: unknown) {
      const apiError = asApiError(err);
      toast.error(apiError.response?.data?.title || t('manageUsers.errorToggle'));
    }
  };

  const getStatusLabel = (user: UserModerationDto): string => {
    const status = user.status || (user.isDeleted ? 'DELETED' : user.isBanned ? 'BANNED' : user.isSuspended ? 'SUSPENDED' : 'ACTIVE');
    return t(`manageUsers.status.${status.toLowerCase()}`);
  };

  const getStatusClass = (user: UserModerationDto): string => {
    const status = user.status || (user.isDeleted ? 'DELETED' : user.isBanned ? 'BANNED' : user.isSuspended ? 'SUSPENDED' : 'ACTIVE');
    return `${styles.statusBadge} ${styles[`status${status[0]}${status.slice(1).toLowerCase()}`]}`;
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
        <label className={styles.statusFilter}>
          <span>{t('manageUsers.filterStatus')}</span>
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
            <option value="">{t('manageReports.filters.all')}</option>
            <option value="ACTIVE">{t('manageUsers.status.active')}</option>
            <option value="SUSPENDED">{t('manageUsers.status.suspended')}</option>
            <option value="BANNED">{t('manageUsers.status.banned')}</option>
            <option value="DELETED">{t('manageUsers.status.deleted')}</option>
          </select>
        </label>
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
                    <span className={getStatusClass(user)}>
                      {getStatusLabel(user)}
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

                        {user.isDeleted ? (
                          <ActionButton variant="change" size="small" onClick={() => handleReactivate(user.id)}>
                            {t('manageUsers.actions.reactivate')}
                          </ActionButton>
                        ) : (
                          <>
                            <ActionButton
                              variant={user.isSuspended ? 'change' : 'suspend'}
                              size="small"
                              onClick={() => user.isSuspended ? handleReactivate(user.id) : setPendingSuspension(user)}
                            >
                              {user.isSuspended ? t('manageUsers.actions.reactivate') : t('manageUsers.actions.suspend')}
                            </ActionButton>
                            <ActionButton
                              variant={user.isBanned ? 'change' : 'delete'}
                              size="small"
                              onClick={() => user.isBanned ? handleToggleBan(user.id, true) : setPendingBan(user)}
                            >
                              {user.isBanned ? t('manageUsers.actions.unban') : t('manageUsers.actions.ban')}
                            </ActionButton>
                          </>
                        )}
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
      <ConfirmationModal
        isOpen={Boolean(pendingBan)}
        title={t('manageUsers.actions.ban')}
        message={t('manageUsers.confirmSuspendMessage')}
        confirmLabel={t('manageUsers.actions.ban')}
        variant="danger"
        onConfirm={() => pendingBan && handleToggleBan(pendingBan.id, pendingBan.isBanned)}
        onCancel={() => setPendingBan(null)}
      />
    </div>
  );
};
