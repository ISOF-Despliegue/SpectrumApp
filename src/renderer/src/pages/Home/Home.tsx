import styles from './Home.module.css';

export const Home = () => {
  return (
    <div className="home-page">
      <div style={{ display: 'flex' }}>
        <main>
          <h1>Bienvenido a la Home</h1>
          <h2>Este es un ejemplo para ver mis subtítulos</h2>
          <p> Este es un ejemplo para ver mi texto</p>
          <p className="smallText"> Este es un ejemplo para ver mi texto</p>
          {/* Aquí irán los componentes de juegos más adelante */}
        <p>Hola</p>
          <div>

          </div>
        </main>
      </div>
    </div>
  );
};

