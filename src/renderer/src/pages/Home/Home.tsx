import styles from './Home.module.css';
import { useTranslation } from 'react-i18next';
import { NavAdminButton } from '../../components/ui/NavBars/NavAdminButton';
import { ProfileImage } from '@renderer/components/ui/ProfileImage';
import { ProfileImageBig } from '@renderer/components/ui/ProfileImageBig';
import { ProfileImageMedium } from '@renderer/components/ui/ProfileImageMedium';
import { GameCard } from '@renderer/components/ui/GameCard';
import { GameCardMedium } from '@renderer/components/ui/GameCardMedium';
import { GameCardBig } from '@renderer/components/ui/GameCardBig';

export const Home = (onProfileClick) => {
const { t } = useTranslation('navbar');

  return (
    <div className="home-page">
      <div style={{ display: 'flex' }}>
        <main>

          <h1>Bienvenido a la Home</h1>
          <h2>Este es un ejemplo para ver mis subtítulos</h2>
          <p> Este es un ejemplo para ver mi texto</p>
          <p className="smallText"> Este es un ejemplo para ver mi texto</p>
          {/* Aquí irán los componentes de juegos más adelante */}
          <NavAdminButton label={t('navbar.adminsManagement')} />
          <ProfileImage
                        imageUrl={undefined}
                        onClick={onProfileClick}
          />

                    <ProfileImageMedium
                        imageUrl={undefined}
                        onClick={onProfileClick}
          />
                    <ProfileImageBig
                        imageUrl={undefined}
                        onClick={onProfileClick}
          />
                              <GameCard
                        imageUrl={undefined}
                        onClick={onProfileClick}
          />
                                        <GameCardMedium
                        imageUrl={undefined}
                        onClick={onProfileClick}
          />
                                        <GameCardBig
                        imageUrl={undefined}
                        onClick={onProfileClick}
          />


        </main>
      </div>
    </div>
  );
};

