import React from 'react';
import styles from './ScoreDisplay.module.css';

interface ScoreDisplayProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, size = 'large' }) => {
  const getScoreState = () => {
    if (score < 60) return { stateClass: styles.rotting, effectClass: styles.drop };
    if (score < 90) return { stateClass: styles.spectral, effectClass: styles.spore };
    return { stateClass: styles.divine, effectClass: styles.sparkle };
  };

  const { stateClass, effectClass } = getScoreState();

  return (
    <div className={`${styles.scoreContainer} ${stateClass} ${styles[size]}`}>
      {size !== 'small' && [...Array(4)].map((_, i) => (
        <div key={i} className={`${styles.particle} ${effectClass}`} />
      ))}

      <div className={styles.numberWrapper}>
        <span className={styles.number}>{score}</span>
      </div>
    </div>
  );
};
