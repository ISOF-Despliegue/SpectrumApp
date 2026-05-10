import styles from './Home.module.css';
import { useTranslation } from 'react-i18next';

export const Home = (onProfileClick) => {
const { t } = useTranslation('navbar');

  return (
    <div className="home-page">
      <div style={{ display: 'flex' }}>
        <main>

          <h1>Bienvenido a la Home</h1>

        </main>
      </div>
    </div>
  );
};

