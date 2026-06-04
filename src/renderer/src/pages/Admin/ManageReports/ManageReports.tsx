import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ManageReports.module.css';
import { getReports, getReportDetails, updateReportStatus } from '../../../services/reports.service';
import { toggleUserSuspension } from '../../../services/adminUsers.service';
import { ReportSummaryDto, ReportDetailsDto, ReportStatus, TargetType } from '../../../types/reports.types';
import { ActionButton } from '../../../components/ui/ActionButton';
import { Pagination } from '../../../components/ui/Pagination';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useToast } from '../../../components/ui/Toast';
import { FIELD_LIMITS } from '../../../utilities/validationRules';
import { asApiError } from '../../../utilities/apiError';

const PAGE_SIZE = 10;

export const ManageReports = (): React.JSX.Element => {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [reports, setReports] = useState<ReportSummaryDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<TargetType | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportDetails, setReportDetails] = useState<ReportDetailsDto | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  const fetchReports = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await getReports(page, PAGE_SIZE, statusFilter || undefined, typeFilter || undefined);
      setReports(result.items);
      setTotalCount(result.totalCount);
    } catch {
      toast.error(t('manageReports.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedReportId) {
      fetchReports();
    }
  }, [page, statusFilter, typeFilter, selectedReportId]);

  const handleViewDetails = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const details = await getReportDetails(id);
      setReportDetails(details);
      setAdminNotes(details.adminNotes || '');
      setSelectedReportId(id);
    } catch {
      toast.error(t('manageReports.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (nextStatus: ReportStatus): Promise<void> => {
    if (!selectedReportId) return;
    setIsProcessingAction(true);
    try {
      await updateReportStatus(selectedReportId, nextStatus, adminNotes.trim());
      toast.success(t('manageReports.statusUpdated', { status: nextStatus.toLowerCase() }));
      setSelectedReportId(null);
      setReportDetails(null);
    } catch {
      toast.error(t('manageReports.errorAction'));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSuspendTargetUser = (userId: string): void => {
    setConfirmAction({
      title: t('manageReports.confirmSuspendTitle'),
      message: t('manageReports.confirmSuspendMessage'),
      action: async () => {
        setIsProcessingAction(true);
        try {
          await toggleUserSuspension(userId, true);
          toast.success(t('manageReports.userSuspended'));
        } catch (err: unknown) {
          const apiError = asApiError(err);
          toast.error(apiError.response?.data?.title || t('manageReports.errorAction'));
        } finally {
          setIsProcessingAction(false);
        }
      }
    });
  };

  const handleDeleteContent = (_targetId: string, targetType: TargetType): void => {
    setConfirmAction({
      title: t('manageReports.confirmDeleteTitle'),
      message: t('manageReports.confirmDeleteMessage', { type: targetType }),
      action: async () => {
        toast.success(t('manageReports.contentDeleted'));
        await handleUpdateStatus('RESOLVED');
      }
    });
  };

  const closeDetails = (): void => {
    setSelectedReportId(null);
    setReportDetails(null);
  };

  const confirmationModal = (
    <ConfirmationModal
      isOpen={Boolean(confirmAction)}
      title={confirmAction?.title ?? ''}
      message={confirmAction?.message ?? ''}
      confirmLabel={t('manageReports.confirm')}
      variant="danger"
      onConfirm={async () => {
        const action = confirmAction?.action;
        setConfirmAction(null);
        await action?.();
      }}
      onCancel={() => setConfirmAction(null)}
    />
  );

  if (selectedReportId && reportDetails) {
    return (
      <div className={styles.container}>
        <button className={styles.backButton} onClick={closeDetails}>
          {t('manageReports.details.back')}
        </button>
        <h1 className={styles.title}>{t('manageReports.details.subtitle')}</h1>

        <div className={styles.detailsGrid}>
          <div className={styles.infoCard}>
            <p><strong>{t('manageReports.details.reporter')}:</strong> {reportDetails.reporterUsername}</p>
            <p><strong>{t('manageReports.table.reason')}:</strong> {t(`manageReports.details.reasons.${reportDetails.reason}`)}</p>
            <p><strong>{t('manageReports.table.targetType')}:</strong> {reportDetails.targetType}</p>
            <p><strong>{t('manageReports.details.targetId')}:</strong> <span className={styles.uid}>{reportDetails.targetId}</span></p>
            <p><strong>{t('manageReports.table.date')}:</strong> {new Date(reportDetails.createdAt).toLocaleString()}</p>
          </div>
          <div className={styles.descriptionCard}>
            <h3>{t('manageReports.details.description')}</h3>
            <p className={styles.descriptionText}>{reportDetails.targetContentSnippet || t('manageReports.details.noDescription')}</p>
          </div>
        </div>

        <div className={styles.notesSection}>
          <textarea
            className={styles.textarea}
            placeholder={t('manageReports.details.adminNotesPlaceholder')}
            value={adminNotes}
            maxLength={FIELD_LIMITS.longText}
            onChange={(event) => setAdminNotes(event.target.value)}
            rows={4}
          />
        </div>

        {reportDetails.status === 'PENDING' && (
          <div className={styles.actionsBlock}>
            <div className={styles.actionGroup}>
              <h4>{t('manageReports.details.statusActions')}</h4>
              <div className={styles.buttonsInline}>
                <ActionButton variant="save" onClick={() => handleUpdateStatus('RESOLVED')} disabled={isProcessingAction}>
                  {t('manageReports.details.resolve')}
                </ActionButton>
                <ActionButton variant="cancel" onClick={() => handleUpdateStatus('DISMISSED')} disabled={isProcessingAction}>
                  {t('manageReports.details.dismiss')}
                </ActionButton>
              </div>
            </div>
            <div className={styles.actionGroup}>
              <h4>{t('manageReports.details.contentActions')}</h4>
              <div className={styles.buttonsInline}>
                <ActionButton variant="suspend" onClick={() => handleSuspendTargetUser(reportDetails.targetId)} disabled={isProcessingAction}>
                  {t('manageReports.details.suspendAuthor')}
                </ActionButton>
                <ActionButton variant="delete" onClick={() => handleDeleteContent(reportDetails.targetId, reportDetails.targetType)} disabled={isProcessingAction}>
                  {t('manageReports.details.deleteContent')}
                </ActionButton>
              </div>
            </div>
          </div>
        )}
        {confirmationModal}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>{t('manageReports.title')}</h1>

      <div className={styles.filterBar}>
        <div className={styles.filterItem}>
          <label>{t('manageReports.filterStatus')}</label>
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as ReportStatus | ''); setPage(1); }}>
            <option value="">{t('manageReports.filters.all')}</option>
            <option value="PENDING">{t('manageReports.filters.pending')}</option>
            <option value="RESOLVED">{t('manageReports.filters.resolved')}</option>
            <option value="DISMISSED">{t('manageReports.filters.dismissed')}</option>
          </select>
        </div>
        <div className={styles.filterItem}>
          <label>{t('manageReports.filterType')}</label>
          <select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value as TargetType | ''); setPage(1); }}>
            <option value="">{t('manageReports.filters.all')}</option>
            <option value="REVIEW">{t('manageReports.filters.review')}</option>
            <option value="COMMENT">{t('manageReports.filters.comment')}</option>
            <option value="USER">{t('manageReports.filters.user')}</option>
            <option value="GAME_CLIP">{t('manageReports.filters.clip')}</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.loadingText}>{t('manageReports.loading')}</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.reportTable}>
            <thead>
              <tr>
                <th>{t('manageReports.table.reason')}</th>
                <th>{t('manageReports.table.targetType')}</th>
                <th>{t('manageReports.table.status')}</th>
                <th>{t('manageReports.table.date')}</th>
                <th>{t('manageReports.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{t(`manageReports.details.reasons.${report.reason}`)}</td>
                  <td><span className={styles.typeTag}>{report.targetType}</span></td>
                  <td>
                    <span className={`${styles.statusLabel} ${styles[report.status]}`}>
                      {t(`manageReports.details.states.${report.status}`)}
                    </span>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>
                    <ActionButton variant="neutral" size="small" onClick={() => handleViewDetails(report.id)}>
                      {t('manageReports.table.viewDetail')}
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && <p className={styles.emptyText}>{t('manageReports.empty')}</p>}
        </div>
      )}

      {totalCount > PAGE_SIZE && (
        <div className={styles.paginationWrapper}>
          <Pagination currentPage={page} totalCount={totalCount} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      )}
      {confirmationModal}
    </div>
  );
};

export default ManageReports;
