import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';

export const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main>
          <h1>Bienvenido a la Home</h1>
          {/* Aquí irán los componentes de juegos más adelante */}
        </main>
      </div>
    </div>
  );
};

