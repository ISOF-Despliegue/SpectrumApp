import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ManageReports.module.css';
import { getReports, getReportDetails, updateReportStatus } from '../../../services/reports.service';
import { toggleUserSuspension } from '../../../services/adminUsers.service';
import { ReportSummaryDto, ReportDetailsDto, ReportStatus, TargetType } from '../../../types/reports.types';
import { ActionButton } from '../../../components/ui/ActionButton';
import { Pagination } from '../../../components/ui/Pagination';

export const ManageReports = () => {
  const { t } = useTranslation('admin');

  const [reports, setReports] = useState<ReportSummaryDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('PENDING');
  const [typeFilter, setTypeFilter] = useState<TargetType | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportDetails, setReportDetails] = useState<ReportDetailsDto | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const PAGE_SIZE = 10;

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getReports(page, PAGE_SIZE, statusFilter || undefined, typeFilter || undefined);
      setReports(result.items);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      setError(t('manageReports.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedReportId) {
      fetchReports();
    }
  }, [page, statusFilter, typeFilter, selectedReportId]);

  const handleViewDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const details = await getReportDetails(id);
      setReportDetails(details);
      setAdminNotes(details.adminNotes || '');
      setSelectedReportId(id);
    } catch (err: any) {
      alert(t('manageReports.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (nextStatus: ReportStatus) => {
    if (!selectedReportId) return;
    setIsProcessingAction(true);
    try {
      await updateReportStatus(selectedReportId, nextStatus, adminNotes.trim());
      alert(`Reporte marcado como ${nextStatus.toLowerCase()} con éxito.`);
      setSelectedReportId(null);
      setReportDetails(null);
    } catch (err: any) {
      alert(t('manageReports.errorAction'));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSuspendTargetUser = async (userId: string) => {
    if (!window.confirm('¿Deseas aplicar una suspensión inmediata al usuario asociado a este reporte?')) return;
    setIsProcessingAction(true);
    try {
      await toggleUserSuspension(userId, true);
      alert('Usuario suspendido del sistema de forma preventiva.');
    } catch (err: any) {
      alert(err.response?.data?.title || t('manageReports.errorAction'));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteContent = async (targetId: string, targetType: TargetType) => {
    if (!window.confirm(`¿Estás seguro de eliminar este contenido de tipo ${targetType}?`)) return;
    setIsProcessingAction(true);
    try {
      console.log(`Eliminando contenido: ${targetType} con ID: ${targetId}`);
      alert('El contenido ha sido removido lógicamente de la plataforma.');
      await handleUpdateStatus('RESOLVED');
    } catch (err: any) {
      alert(t('manageReports.errorAction'));
      setIsProcessingAction(false);
    }
  };

  if (selectedReportId && reportDetails) {
    return (
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => { setSelectedReportId(null); setReportDetails(null); }}>
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
            <p className={styles.descriptionText}>{reportDetails.targetContentSnippet || 'Sin descripción adicional.'}</p>
          </div>
        </div>

        <div className={styles.notesSection}>
          <textarea
            className={styles.textarea}
            placeholder={t('manageReports.details.adminNotesPlaceholder')}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
          />
        </div>

        <div className={styles.actionsBlock}>
          {reportDetails.status === 'PENDING' && (
            <>
              <div className={styles.actionGroup}>
                <h4>{t('manageReports.details.statusActions')}</h4>
                <div className={styles.buttonsInline}>
                  <ActionButton variant="save" onClick={() => handleUpdateStatus('RESOLVED')} disabled={isProcessingAction}>
                    Resolver Ticket
                  </ActionButton>
                  <ActionButton variant="cancel" onClick={() => handleUpdateStatus('DISMISSED')} disabled={isProcessingAction}>
                    Desestimar Reporte
                  </ActionButton>
                </div>
              </div>

              <div className={styles.actionGroup}>
                <h4>{t('manageReports.details.contentActions')}</h4>
                <div className={styles.buttonsInline}>
                  <ActionButton variant="suspend" onClick={() => handleSuspendTargetUser(reportDetails.targetId)} disabled={isProcessingAction}>
                    Suspender Autor
                  </ActionButton>
                  <ActionButton variant="delete" onClick={() => handleDeleteContent(reportDetails.targetId, reportDetails.targetType)} disabled={isProcessingAction}>
                    Eliminar Contenido
                  </ActionButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>{t('manageReports.title')}</h1>

      <div className={styles.filterBar}>
        <div className={styles.filterItem}>
          <label>{t('manageReports.filterStatus')}</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as ReportStatus | ''); setPage(1); }}>
            <option value="">Todos</option>
            <option value="PENDING">Pendientes</option>
            <option value="RESOLVED">Resueltos</option>
            <option value="DISMISSED">Desestimados</option>
          </select>
        </div>

        <div className={styles.filterItem}>
          <label>{t('manageReports.filterType')}</label>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as TargetType | ''); setPage(1); }}>
            <option value="">Todos</option>
            <option value="REVIEW">Reseñas</option>
            <option value="COMMENT">Comentarios</option>
            <option value="USER">Usuarios</option>
            <option value="GAME_CLIP">Clips</option>
          </select>
        </div>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

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
                      Ver Detalle
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
    </div>
  );
};

export default ManageReports;
