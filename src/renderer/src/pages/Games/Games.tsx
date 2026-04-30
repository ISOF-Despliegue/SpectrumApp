import React, { useState,  useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { GameCardBig } from '../../components/ui/GameCardBig'; //
import { getGames, Game } from '../../services/games.service';
import styles from './Games.module.css';

export const Games = () => {
  const { t: tGames } = useTranslation('games'); //
  const { t: tCommon } = useTranslation('common'); //

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

 const fetchGames = async (searchTerm?: string) => {
    try {
      setLoading(true);
      const data = await getGames(searchTerm);
      setGames(data);
    } catch (error) {
      console.error("No se pudieron cargar los juegos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className={styles.gamesPage}>

      <header className={styles.header}>

        <h1>{tGames('general.videogames')}</h1>

          <div className={styles.searchBlock}>
          <p>{tCommon('searchers.searchByName')}:</p>
          <div className={styles.inputWrapper}>
            <Input
              onChange={(e) => fetchGames(e.target.value)}
            />
          </div>

        </div>

      </header>

      <div className={styles.gamesGrid}>
        {loading ? (
          <p style={{ color: 'white' }}>Cargando catálogo...</p>
        ) : (
          games.map((game) => (
            <div key={game.id} className={styles.gameWrapper}>
              <GameCardBig
                imageUrl={game.imageUrl}
                onClick={() => console.log(`Detalles de ${game.title}`)}
              />
              <p className={styles.gameLabel}>{game.title}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
