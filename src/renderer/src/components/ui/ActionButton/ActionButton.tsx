import React from 'react';
import styles from './ActionButton.module.css';

interface ActionButtonProps {
  /// <summary>
  /// The visual variant determining the button's purpose and color scheme.
  /// </summary>
  variant: 'save' | 'cancel' | 'block' | 'change' | 'delete' | 'neutral' | 'suspend' | 'deleteProfile';
  size?: 'large' | 'small';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

/// <summary>
/// A standardized button component for the Spectrum platform following camelCase conventions.
/// </summary>
export const ActionButton: React.FC<ActionButtonProps> = ({
  variant,
  size = 'large',
  onClick,
  children,
  disabled = false
}) => {
  const variantName = `btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`;
  const sizeName = `size${size.charAt(0).toUpperCase() + size.slice(1)}`;
  const className = `${styles.actionButton} ${styles[variantName]} ${styles[sizeName]}`;

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
