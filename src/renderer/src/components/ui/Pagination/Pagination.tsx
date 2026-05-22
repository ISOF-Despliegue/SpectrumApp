import { useTranslation } from 'react-i18next';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalCount, pageSize, onPageChange }: PaginationProps) => {
  const { t } = useTranslation('common');
  const totalPages = Math.ceil(totalCount / pageSize);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.pageBtn}
        aria-label={t('pagination.previous')}
      >
        &laquo;
      </button>

      {getPageNumbers().map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${styles.pageBtn} ${currentPage === p ? styles.active : ''}`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.pageBtn}
        aria-label={t('pagination.next')}
      >
        &raquo;
      </button>

      <span className={styles.totalInfo}>
        {t('pagination.pageInfo', { current: currentPage, total: totalPages })}
      </span>
    </nav>
  );
};
