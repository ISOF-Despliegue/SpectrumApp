import type React from 'react';
import styles from './TrendBarChart.module.css';

export interface TrendChartEntry {
  id: string;
  label: string;
  value: number;
  valueLabel?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  meta?: string;
  rank?: number;
  accent?: string;
  onClick?: () => void;
}

interface TrendBarChartProps {
  items: TrendChartEntry[];
  emptyMessage: string;
  ariaLabel: string;
  imageShape?: 'cover' | 'avatar' | 'icon';
}

const formatFallback = (label: string): string => label.trim().charAt(0).toUpperCase() || 'S';

const TrendChartItem = ({
  item,
  maxValue,
  imageShape
}: {
  item: TrendChartEntry;
  maxValue: number;
  imageShape: 'cover' | 'avatar' | 'icon';
}): React.JSX.Element => {
  const ratio = maxValue > 0 ? item.value / maxValue : 0;
  const barWidth = `${Math.max(item.value > 0 ? 10 : 0, ratio * 100)}%`;
  const content = (
    <>
      <span className={styles.rank}>{item.rank ? `#${item.rank}` : '-'}</span>
      <span className={`${styles.media} ${styles[imageShape]}`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.imageAlt || item.label} loading="lazy" />
        ) : (
          <span className={styles.fallback}>{formatFallback(item.label)}</span>
        )}
      </span>
      <span className={styles.content}>
        <span className={styles.textLine}>
          <strong>{item.label}</strong>
          <em>{item.valueLabel || item.value}</em>
        </span>
        {item.meta && <small>{item.meta}</small>}
        <span className={styles.track} aria-hidden="true">
          <i style={{ width: barWidth, background: item.accent }} />
        </span>
      </span>
    </>
  );

  if (item.onClick) {
    return (
      <button type="button" className={styles.item} onClick={item.onClick} aria-label={item.label}>
        {content}
      </button>
    );
  }

  return <div className={styles.item}>{content}</div>;
};

/**
 * Renders a compact ranked bar chart for trend dashboards without depending on a charting library.
 */
export const TrendBarChart = ({
  items,
  emptyMessage,
  ariaLabel,
  imageShape = 'cover'
}: TrendBarChartProps): React.JSX.Element => {
  if (items.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={styles.chart} role="img" aria-label={ariaLabel}>
      {items.map((item, index) => (
        <TrendChartItem
          key={item.id}
          item={{ ...item, rank: item.rank || index + 1 }}
          maxValue={maxValue}
          imageShape={imageShape}
        />
      ))}
    </div>
  );
};
