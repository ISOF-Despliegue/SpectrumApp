import React, { useState } from 'react';
import styles from './ReportModal.module.css';
import { ActionButton } from '../ActionButton';
import { TargetType } from '../../../types/reports.types';
import { submitReport } from '../../../services/reports.service';
import { useTranslation } from 'react-i18next';

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
  const [reason, setReason] = useState('INAPPROPRIATE_CONTENT');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('report');

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
    setError(null);
    if (description.trim().length < 10) {
      setError(t('reportModal.lengthError'));
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
      alert(t('reportModal.successMessage'));
      setDescription('');
      onClose();
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(t('reportModal.tooManyReports'));
      } else if (err.response?.status === 409) {
        setError(t('reportModal.alreadyReported'));
      } else {
        setError(err.response?.data?.title || t('reportModal.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContent}>
        <h2>{t('reportModal.title')}</h2>
        <div className={styles.formContent}>

          <select
            className={styles.selectInput}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="SPAM">{t('reportModal.reportReasons.SPAM')}</option>
            <option value="HARASSMENT">{t('reportModal.reportReasons.HARASSMENT')}</option>
            <option value="INAPPROPRIATE_CONTENT">{t('reportModal.reportReasons.INAPPROPRIATE_CONTENT')}</option>
            <option value="SPOILERS">{t('reportModal.reportReasons.SPOILERS')}</option>
            <option value="OTHER">{t('reportModal.reportReasons.OTHER')}</option>
          </select>

          <textarea
            placeholder={t('reportModal.placeholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={styles.textarea}
          />

          {error && <p className={styles.errorText}>{error}</p>}

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
