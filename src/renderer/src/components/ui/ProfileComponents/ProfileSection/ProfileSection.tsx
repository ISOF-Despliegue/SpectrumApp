import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassContainer } from '../../GlassContainer/GlassContainer';
import { ActionButton } from '../../ActionButton/ActionButton';
import { SortFilter, SortOption } from '../../SortFilter/SortFilter';
import styles from './ProfileSection.module.css';

interface ProfileSectionProps {
  title: string;
  onSeeMore?: () => void;
  onOrderChange?: (criteria: string) => void;
  currentSortValue?: string;
  showSeeMore?: boolean;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

/// <summary>
/// A layout component that groups related profile items within a GlassContainer.
/// Uses internationalization and the SortFilter custom component.
/// </summary>
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  onSeeMore,
  onOrderChange,
  currentSortValue = 'recent',
  showSeeMore = false,
  children,
  headerActions
}) => {
  const { t } = useTranslation('profile');

  const sortOptions: SortOption[] = [
    { value: 'recent', label: t('orderOptions.recent') },
    { value: 'oldest', label: t('orderOptions.oldest') },
    { value: 'alphabetical', label: t('orderOptions.alphabetical') }
  ];

  return (
    <section className={styles.profileSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>

        <div className={styles.headerControls}>
          {headerActions}
          {onOrderChange && (
            <SortFilter
              label={t('labels.orderBy')}
              currentValue={currentSortValue}
              options={sortOptions}
              onSortChange={onOrderChange}
            />
          )}
        </div>
      </div>

      <GlassContainer>
        <div className={styles.sectionContent}>
          {children}
        </div>
      </GlassContainer>

      {showSeeMore && (
        <div className={styles.seeMoreContainer}>
          <ActionButton variant="neutral" size="small" onClick={onSeeMore}>
            {t('actions.seeMore')}
          </ActionButton>
        </div>
      )}
    </section>
  );
};
