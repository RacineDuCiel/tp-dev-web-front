import { createContext, useContext, useEffect, useRef, useState } from 'react';
import keycloak from '../keycloak';
import LoadingSpinner from '../components/LoadingSpinner';

interface AuthContextValue {
  authenticated: boolean;
  userName?: string;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  authenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // useRef pour éviter une double initialisation en React StrictMode (double useEffect en dev)
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    /**
     * onLoad: 'login-required' → redirige automatiquement vers la page de login Keycloak
     * si l'utilisateur n'est pas encore connecté.
     * checkLoginIframe: false → désactive la vérification par iframe (évite des problèmes
     * avec les politiques de cookies SameSite en développement).
     */
    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then(auth => {
        setAuthenticated(auth);
        setInitialized(true);
      })
      .catch(() => {
        setInitialized(true);
      });
  }, []);

  // Pendant l'initialisation Keycloak, on affiche un spinner et on ne rend rien d'autre.
  // Cela évite un flash de l'interface non authentifiée.
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        userName: keycloak.tokenParsed?.preferred_username as string | undefined,
        login: () => keycloak.login(),
        logout: () => keycloak.logout({ redirectUri: window.location.origin }),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
