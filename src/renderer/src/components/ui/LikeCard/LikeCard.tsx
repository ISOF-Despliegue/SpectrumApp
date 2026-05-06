import React, { useState } from 'react'
import styles from './LikeCard.module.css'
import manoLike from '../../../assets/images/common/manoLike.png'
import manoLikeActive from '../../../assets/images/common/manoLikeActive.png'

interface LikeCardProps {
  initialLikes?: number
  likedByUser?: boolean
  onToggle?: (active: boolean) => void
  size?: 'small' | 'medium'
  likes?: number
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

export const LikeCard: React.FC<LikeCardProps> = ({
  initialLikes = 0,
  likedByUser = false,
  onToggle,
  size = 'medium',
  likes,
  active,
  disabled = false,
  onClick
}) => {
  const [internalActive, setInternalActive] = useState(likedByUser)
  const [count, setCount] = useState(initialLikes)
  const isControlled = likes !== undefined || active !== undefined || onClick !== undefined
  const displayedActive = active ?? internalActive
  const displayedCount = likes ?? count

  const handleLike = (): void => {
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
      onClick={handleLike}
      disabled={disabled}
      type="button"
      aria-label="Like"
    >
      <div className={styles.iconWrapper}>
        <img
          src={displayedActive ? manoLikeActive : manoLike}
          alt="Like icon"
          className={styles.icon}
        />
      </div>

      <div className={styles.counterWrapper}>
        <span className={styles.counter}>{displayedCount}</span>
      </div>
    </button>
  )
}
