import styles from './Home.module.css';

export const Home = () => {
  return (
    <div className="home-page">
      <div style={{ display: 'flex' }}>
        <main>
          <h1 className={styles.h1}>Bienvenido a la Home</h1>
          <h2 className={styles.h2}>Este es un ejemplo para ver mis subtítulos</h2>
          <p className={styles.p}> Este es un ejemplo para ver mi texto</p>
          <p className={styles.smallText}> Este es un ejemplo para ver mi texto</p>
          {/* Aquí irán los componentes de juegos más adelante */}

          <div>

          </div>
        </main>
      </div>
    </div>
  );
};

