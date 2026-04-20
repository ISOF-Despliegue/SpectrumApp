import React, { useState } from "react";
import { Home } from "./pages/Home";
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { Admin } from "./pages/Admin";

type ViewState = "home" | "login" | "register" | "admin";

function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<ViewState>("login");

  // Renderizado condicional basado en el estado (Temporal hasta usar un router)
  switch (currentView) {
    case 'login':
      return (
        <Login
          onSwitchToRegister={() => setCurrentView('register')}
          onLoginSuccess={() => setCurrentView('home')}
           onGoToAdmin={() => setCurrentView('admin')}
        />
      )
    case 'register':
      return (
        <Register
          onSwitchToLogin={() => setCurrentView('login')}
          onRegisterSuccess={() => setCurrentView('home')}
        />
      )
    case 'admin':
      return (
        <div>
          <button
            style={{ margin: '1rem', padding: '0.5rem', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => setCurrentView('login')}
          >
            Cerrar Sesión (Demo)
          </button>
          <Admin />
        </div>
      )
    case 'home':
    default:
      return (
        <div>
          <button
            style={{ margin: '1rem', padding: '0.5rem', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => setCurrentView('login')}
          >
            Cerrar Sesión (Demo)
          </button>
          <Home />
        </div>
      )
  }
}

export default App;
