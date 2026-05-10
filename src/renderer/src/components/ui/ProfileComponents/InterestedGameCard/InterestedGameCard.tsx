import React from 'react';
import './InterestedGameCard.module.css';
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
    <div className="gameCardContainer">
      <img
        src={imageUrl || 'https://via.placeholder.com/120x160'}
        alt={title}
        className="gameImage"
      />

      <div className="gameTitleTooltip">{title}</div>

      {isEditable && (
        <div className="deleteBadge">
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
