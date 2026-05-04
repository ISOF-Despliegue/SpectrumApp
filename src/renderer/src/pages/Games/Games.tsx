import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { GameCardBig } from '../../components/ui/GameCardBig';
import { getGames, Game } from '../../services/games.service';
import styles from './Games.module.css';
import { Pagination } from '@renderer/components/ui/Pagination/Pagination';
import { SortFilter } from '../../components/ui/SortFilter/SortFilter';

export const Games = () => {
  const navigate = useNavigate();

  const { t: tGames } = useTranslation('games');
  const { t: tCommon } = useTranslation('common');

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("none");

  const sortOptions = [
    { value: 'none', label: tCommon('filters.options.default') },
    { value: 'name_asc', label: tCommon('filters.options.nameAsc') },
    { value: 'name_desc', label: tCommon('filters.options.nameDesc') },
    { value: 'date_new', label: tCommon('filters.options.dateNew') },
    { value: 'date_old', label: tCommon('filters.options.dateOld') },
  ];

  const fetchGames = async (page: number, search?: string, sort?: string) => {
    try {
      setLoading(true);
      const response = await getGames(search, page, sort);
      setGames(response.items);
      setTotalCount(response.totalCount);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error al obtener juegos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchGames(1, searchTerm, sortOption);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchGames(1, searchTerm, sortOption);
  }, [sortOption]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    fetchGames(newPage, searchTerm, sortOption);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReviews = (gameId: number) => {
    navigate(`/games/${gameId}/reviews`);
  };

  return (
    <div className={styles.gamesPage}>
      <header className={styles.header}>
        <h1>{tGames('general.videogames')}</h1>

        <div className={styles.searchBlock}>
          <p className={styles.searchText}>{tCommon('searchers.searchByName')}:</p>
          <div className={styles.inputWrapper}>
            <Input
              value={searchTerm}
              onChange={handleSearch}
              placeholder="..."
            />
          </div>
        </div>
      </header>

      <SortFilter
        label={tCommon('filters.sortBy')}
        currentValue={sortOption}
        options={sortOptions}
        onSortChange={setSortOption}
      />

      {loading && games.length === 0 ? (
        <p className={styles.loading}>{tGames('status.loading')}</p>
      ) : (
        <>
          <div className={styles.gamesGrid}>
            {games.length > 0 ? (
              games.map((game) => (
                <div key={game.id} className={styles.gameWrapper}>
                  <GameCardBig
                    imageUrl={game.imageUrl}
                    onClick={() => handleOpenReviews(game.id)}
                  />
                  <p className={styles.gameLabel}>{game.title}</p>
                </div>
              ))
            ) : (
              <p className={styles.noResults}>{tGames('status.noResults', { term: searchTerm })}</p>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={42}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};
