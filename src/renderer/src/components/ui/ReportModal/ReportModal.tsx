import React, { useEffect, useState } from 'react';
import styles from './ReportModal.module.css';
import { ActionButton } from '../ActionButton';
import { TargetType } from '../../../types/reports.types';
import { submitReport } from '../../../services/reports.service';
import { useTranslation } from 'react-i18next';
import { useToast } from '../Toast';
import { FIELD_LIMITS } from '../../../utilities/validationRules';
import { asApiError } from '../../../utilities/apiError';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: TargetType;
  currentUserId?: string;
  targetOwnerId?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  currentUserId,
  targetOwnerId
}) => {
  const [reason, setReason] = useState('CONTENIDO_INAPROPIADO');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation('report');
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (currentUserId && targetOwnerId && currentUserId === targetOwnerId) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
          <h2 id="report-modal-title">{t('reportModal.title')}</h2>
          <p>{t('reportModal.notAllowed')}</p>
          <div className={styles.actions}>
            <ActionButton variant="neutral" onClick={onClose}>{t('reportModal.closeButton')}</ActionButton>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event?.preventDefault();

    if (description.trim().length < 10) {
      toast.warning(t('reportModal.lengthError'));
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport({
        targetId,
        targetType,
        reason,
        description: description.trim()
      });
      toast.success(t('reportModal.successMessage'));
      setDescription('');
      onClose();
    } catch (err: unknown) {
      const apiError = asApiError(err);
      if (apiError.response?.status === 429) {
        toast.error(t('reportModal.tooManyReports'));
      } else if (apiError.response?.status === 409) {
        toast.error(t('reportModal.alreadyReported'));
      } else {
        toast.error(apiError.response?.data?.title || t('reportModal.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="report-modal-title">{t('reportModal.title')}</h2>
        <form className={styles.formContent} onSubmit={handleSubmit}>

          <label className={styles.field}>
            <span>{t('reportModal.reasonLabel')}</span>
            <select
              className={styles.selectInput}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="SPAM">{t('reportModal.reportReasons.SPAM')}</option>
              <option value="ACOSO">{t('reportModal.reportReasons.ACOSO')}</option>
              <option value="CONTENIDO_INAPROPIADO">{t('reportModal.reportReasons.CONTENIDO_INAPROPIADO')}</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>{t('reportModal.descriptionLabel')}</span>
            <textarea
              placeholder={t('reportModal.placeholder')}
              value={description}
              maxLength={FIELD_LIMITS.reportDescription}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={styles.textarea}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>{t('reportModal.cancelButton')}</button>
            <ActionButton
              variant="save"
              onClick={() => undefined}
              disabled={isSubmitting || description.trim().length < 10}
            >
              {isSubmitting ? t('reportModal.submitting') : t('reportModal.submitButton')}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};
