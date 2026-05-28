import React, { useState } from 'react';
import styles from './ReportModal.module.css';
import { ActionButton } from '../ActionButton';
import { TargetType } from '../../../types/reports.types';
import { submitReport } from '../../../services/reports.service';
import { useTranslation } from 'react-i18next';
import { useToast } from '../Toast';

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

  if (!isOpen) return null;

  if (currentUserId && targetOwnerId && currentUserId === targetOwnerId) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modalContent}>
          <h2>{t('reportModal.title')}</h2>
          <p>{t('reportModal.notAllowed')}</p>
          <div className={styles.actions}>
            <ActionButton variant="neutral" onClick={onClose}>{t('reportModal.closeButton')}</ActionButton>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
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
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error(t('reportModal.tooManyReports'));
      } else if (err.response?.status === 409) {
        toast.error(t('reportModal.alreadyReported'));
      } else {
        toast.error(err.response?.data?.title || t('reportModal.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div className={styles.modalContent} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <h2>{t('reportModal.title')}</h2>
        <div className={styles.formContent}>

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
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={styles.textarea}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>{t('reportModal.cancelButton')}</button>
            <ActionButton
              variant="save"
              onClick={handleSubmit}
              disabled={isSubmitting || description.trim().length < 10}
            >
              {isSubmitting ? t('reportModal.submitting') : t('reportModal.submitButton')}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};
