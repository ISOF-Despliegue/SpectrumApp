import React from 'react';
import styles from './InterestedGameCard.module.css';
import { ActionButton } from '../../../../components/ui/ActionButton';

/// <summary>
/// Properties for the InterestedGameCard component.
/// </summary>
interface InterestedGameCardProps {
  /// <summary>
  /// The unique identifier of the game.
  /// </summary>
  id: string;
  title: string;
  imageUrl?: string;
  isEditable: boolean;
  onDelete?: (id: string) => void;
}

/// <summary>
/// A card component that displays a game's thumbnail and provides
/// an optional delete action for profile management.
/// </summary>
export const InterestedGameCard: React.FC<InterestedGameCardProps> = ({
  id,
  title,
  imageUrl,
  isEditable,
  onDelete
}) => {
  return (
    <div className={styles.gameCardContainer}>
      <img
        src={imageUrl || 'https://via.placeholder.com/120x160'}
        alt={title}
        className={styles.gameImage}
      />

      <div className={styles.gameTitleTooltip}>{title}</div>

      {isEditable && (
        <div className={styles.deleteBadge}>
          <ActionButton
            variant="delete"
            size="small"
            onClick={() => onDelete?.(id)}
          >
            Borrar
          </ActionButton>
        </div>
      )}
    </div>
  );
};
