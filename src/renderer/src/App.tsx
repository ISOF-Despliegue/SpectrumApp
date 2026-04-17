import React, { useState } from "react";
import { Home } from "./pages/Home";
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { MainLayout } from "./components/ui/MainLayout";

type ViewState = "home" | "login" | "register";

function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<ViewState>("login");

  // Renderizado condicional basado en el estado (Temporal hasta usar un router)
  switch (currentView) {
    case 'login':
      return (
        <Login
          onSwitchToRegister={() => setCurrentView('register')}
          onLoginSuccess={() => setCurrentView('home')}
        />
      )
    case 'register':
      return (
        <Register
          onSwitchToLogin={() => setCurrentView('login')}
          onRegisterSuccess={() => setCurrentView('home')}
        />
      )
    case 'home':
    default:
      return (
        <MainLayout>
          <button
            style={{
              position: 'absolute',
              top: '260px',
              right: '20px',
              padding: '0.5rem',
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              zIndex: 10
            }}
            onClick={() => setCurrentView('login')}
          >
            Cerrar Sesión (Demo)
          </button>
          <Home />
        </MainLayout>
      )
  }
}

export default App;
