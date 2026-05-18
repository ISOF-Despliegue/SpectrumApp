import React, { useState } from 'react';
import styles from './ReportModal.module.css';
import { ActionButton } from '../ActionButton';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'REVIEW' | 'COMMENT' | 'USER';
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetId, targetType }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      console.log('Enviando reporte:', { targetId, targetType, reason });
      alert('Reporte enviado con éxito');
      setReason('');
      onClose();
    } catch (error) {
      alert('Error al enviar el reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContent}>
        <h2>Reportar contenido</h2>
        <div className={styles.formContent}>
          <textarea
            placeholder="¿Por qué reportas este contenido? (Ej. Spam, Lenguaje ofensivo...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className={styles.textarea}
          />
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
            <ActionButton
              variant="save"
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};
