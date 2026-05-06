import React, { useState } from 'react'
import styles from './DislikeCard.module.css'

import manoDislike from '../../../assets/images/common/manoDislike.png'
import manoDislikeActive from '../../../assets/images/common/manoDislikeActive.png'

interface DislikeCardProps {
  initialDislikes?: number
  dislikedByUser?: boolean
  onToggle?: (active: boolean) => void
  size?: 'small' | 'medium'
  dislikes?: number
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

export const DislikeCard: React.FC<DislikeCardProps> = ({
  initialDislikes = 0,
  dislikedByUser = false,
  onToggle,
  size = 'medium',
  dislikes,
  active,
  disabled = false,
  onClick
}) => {
  const [internalActive, setInternalActive] = useState(dislikedByUser)
  const [count, setCount] = useState(initialDislikes)
  const isControlled = dislikes !== undefined || active !== undefined || onClick !== undefined
  const displayedActive = active ?? internalActive
  const displayedCount = dislikes ?? count

  const handleDislike = (): void => {
    if (disabled) {
      return
    }

    if (onClick) {
      onClick()
      return
    }

    const newState = !displayedActive

    if (!isControlled) {
      setInternalActive(newState)
      setCount((prev) => (newState ? prev + 1 : prev - 1))
    }

    if (onToggle) onToggle(newState)
  }

  return (
    <button
      className={`${styles.container} ${displayedActive ? styles.activeState : ''} ${styles[size]}`}
      onClick={handleDislike}
      disabled={disabled}
      type="button"
      aria-label="Dislike"
    >
      <div className={styles.iconWrapper}>
        <img
          src={displayedActive ? manoDislikeActive : manoDislike}
          alt="Dislike icon"
          className={styles.icon}
        />
      </div>

      <div className={styles.counterWrapper}>
        <span className={styles.counter}>{displayedCount}</span>
      </div>
    </button>
  )
}
