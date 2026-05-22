import styles from './SortFilter.module.css';

export interface SortOption {
  value: string;
  label: string;
}

interface SortFilterProps {
  label: string;
  currentValue: string;
  options: SortOption[];
  onSortChange: (value: string) => void;
}

export const SortFilter = ({ label, currentValue, options, onSortChange }: SortFilterProps) => {
  return (
    <div className={styles.filterBar}>
      <label className={styles.filterLabel}>{label}:</label>

      <select
        className={styles.select}
        value={currentValue}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
