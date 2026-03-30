import { NavLink, Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">

          <NavLink to="/" className="font-semibold text-gray-900 text-sm shrink-0">
            Bibliothèque
          </NavLink>

          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm transition-colors duration-150 ${
                  isActive
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              Accueil
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm transition-colors duration-150 ${
                  isActive
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              Livres
            </NavLink>
            <NavLink
              to="/authors"
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm transition-colors duration-150 ${
                  isActive
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              Auteurs
            </NavLink>
          </nav>

          {/* Espace réservé — bouton Keycloak Phase 3 */}
          <div className="w-8 shrink-0" />
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
