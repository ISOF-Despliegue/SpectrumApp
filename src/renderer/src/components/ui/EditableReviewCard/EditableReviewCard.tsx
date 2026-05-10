import React from 'react';
import { ReviewCardPre } from '../ReviewCards/ReviewCardPre';
import { ActionButton } from '../ActionButton/ActionButton';
import './EditableReviewCard.module.css';

interface EditableReviewCardProps {
  reviewData: any;
  isEditable: boolean;
  onDelete?: (id: string) => void;
}

/// <summary>
/// A wrapper component for ReviewCardPre that adds a delete action
/// without modifying the original component's source code.
/// </summary>
export const EditableReviewCard: React.FC<EditableReviewCardProps> = ({
  reviewData,
  isEditable,
  onDelete
}) => {
  return (
    <div className="editableReviewWrapper">
      <ReviewCardPre {...reviewData} />

      {isEditable && (
        <div className="reviewDeleteBadge">
          <ActionButton
            variant="delete"
            size="small"
            onClick={() => onDelete?.(reviewData.id)}
          >
            Borrar
          </ActionButton>
        </div>
      )}
    </div>
  );
};
