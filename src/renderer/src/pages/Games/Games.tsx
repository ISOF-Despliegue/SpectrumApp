import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { GameCardBig } from '../../components/ui/GameCardBig'; //
import styles from './Games.module.css';

export const Games = () => {
  const { t: tGames } = useTranslation('games'); //
  const { t: tCommon } = useTranslation('common'); //

  const gamesData = [
    { id: 1, title: 'Halo Infinite', image: 'https://via.placeholder.com/600x350' },
    { id: 2, title: 'Elden Ring', image: 'https://via.placeholder.com/600x350' },
    { id: 3, title: 'Cyberpunk 2077', image: 'https://via.placeholder.com/600x350' },
    { id: 4, title: 'Fortnite', image: 'https://via.placeholder.com/600x350' },
    { id: 5, title: 'Minecraft', image: 'https://via.placeholder.com/600x350' },
    { id: 6, title: 'Brawl Stars', image: 'https://via.placeholder.com/600x350' },
  ];

  return (
    <div className={styles.gamesPage}>

      <header className={styles.header}>

        <h1>{tGames('general.videogames')}</h1>

        <div className={styles.searchBlock}>

          <h2>{tCommon('searchers.searchByName')}:</h2>
          <div className={styles.inputWrapper}>
            <Input
              onChange={(e) => console.log(e.target.value)}
            />
          </div>

        </div>

      </header>

      <div className={styles.gamesGrid}>

        {gamesData.map((game) => (
          <div key={game.id} className={styles.gameWrapper}>
            <GameCardBig
              imageUrl={game.image}
              onClick={() => console.log(`Clic en ${game.title}`)}
            />
            <p className={styles.gameLabel}>{game.title}</p>
          </div>
        ))}

      </div>

    </div>
  );
};
