import React from 'react';
import './PreviewClio.css';
import { ActionButton } from '../ActionButton';

interface PreviewClipProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: string;
  isEditable: boolean;
  onDelete?: (id: string) => void;
}

/// <summary>
/// A component that displays a video thumbnail with basic metadata
/// and an optional delete action for profile or administrative management.
/// </summary>
export const PreviewClip: React.FC<PreviewClipProps> = ({
  id,
  title,
  thumbnailUrl,
  duration,
  isEditable,
  onDelete
}) => {
  return (
    <div className="clipContainer">
      <img
        src={thumbnailUrl || 'https://via.placeholder.com/240x135'}
        alt={title}
        className="clipThumbnail"
      />

      <div className="infoLayer">
        <span className="clipTitle">{title}</span>
        {duration && <span className="clipDuration">{duration}</span>}
      </div>

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

      <div className="playIcon">▶</div>
    </div>
  );
};
