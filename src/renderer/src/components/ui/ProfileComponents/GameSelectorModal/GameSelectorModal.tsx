import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './GameSelectorModal.module.css';
import { getGames, Game } from '../../../../services/games.service';
import { ProfileGame } from '../../../../services/profile.service';
import { Input } from '../../../../components/ui/Input';
import { Pagination } from '../../../../components/ui/Pagination/Pagination';
import { SortFilter } from '../../../../components/ui/SortFilter/SortFilter';
import { GameCardBig } from '../../../../components/ui/GameCardBig';
import { ActionButton } from '../../../../components/ui/ActionButton';

interface GameSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (game: ProfileGame) => void;
  alreadySelectedIds: string[];
}

/// <summary>
/// Modal component that allows users to search, filter, and select games to add to their profile.
/// It replicates the logic from the main Games page for consistency.
/// Includes visual feedback for games already present in the user's profile via dynamic classes.
/// </summary>
export const GameSelectorModal: React.FC<GameSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  alreadySelectedIds
}) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tProfile } = useTranslation('profile');

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('none');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const sortOptions = [
    { value: 'none', label: tCommon('filters.options.default') },
    { value: 'name_asc', label: tCommon('filters.options.nameAsc') },
    { value: 'name_desc', label: tCommon('filters.options.nameDesc') },
    { value: 'date_new', label: tCommon('filters.options.dateNew') },
    { value: 'date_old', label: tCommon('filters.options.dateOld') },
  ];

  /// <summary>
  /// Fetches games from the service based on current search, sort, and pagination state.
  /// </summary>
  const fetchGames = async (page: number, search: string, sort: string) => {
    setLoading(true);
    try {
      const response = await getGames(search, page, sort);
      setGames(response.items);
      setTotalCount(response.totalCount);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching games for selector:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const delayDebounceFn = setTimeout(() => {
      fetchGames(1, searchTerm, sortOption);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isOpen]);

  useEffect(() => {
    if (isOpen) fetchGames(1, searchTerm, sortOption);
  }, [sortOption, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <header className={styles.header}>
          <h2>{tProfile('selector.title')}</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </header>

        <section className={styles.filters}>
          <div className={styles.searchBox}>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={tCommon('searchers.searchByName')}
            />
          </div>
          <SortFilter
            label={tCommon('filters.sortBy')}
            currentValue={sortOption}
            options={sortOptions}
            onSortChange={setSortOption}
          />
        </section>

        <div className={styles.gamesGrid}>
          {loading ? (
            <p className={styles.loading}>{tCommon('status.loading')}</p>
          ) : (
            games.map((game) => {
              const isAdded = alreadySelectedIds.includes(game.id.toString());

              const handleSelect = () => {
                if (!isAdded) {
                  onSelect({ id: game.id.toString(), name: game.title, imageUrl: game.imageUrl });
                }
              };

              return (
                <div
                  key={game.id}
                  className={`${styles.gameItem} ${isAdded ? styles.gameItemAdded : ''}`}
                >
                  <GameCardBig
                    imageUrl={game.imageUrl}
                    onClick={handleSelect}
                  />
                  <div className={styles.gameInfo}>
                    <p>{game.title}</p>
                    <ActionButton
                      variant={isAdded ? "neutral" : "save"}
                      size="small"
                      disabled={isAdded}
                      onClick={handleSelect}
                    >
                      {isAdded ? tProfile('selector.added') : tProfile('selector.add')}
                    </ActionButton>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <footer className={styles.footer}>
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={42}
            onPageChange={(page) => fetchGames(page, searchTerm, sortOption)}
          />
        </footer>
      </div>
    </div>
  );
};
