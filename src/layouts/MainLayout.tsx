/**
 * Layout principal de l'application — enveloppe toutes les pages protégées.
 *
 * Structure :
 * - `<header>` sticky : logo, navigation desktop, toggle dark mode, déconnexion.
 * - Menu mobile : s'ouvre via le bouton burger (visible < 640px), se ferme
 *   automatiquement au changement de route.
 * - `<main>` : rendu de la page active via `<Outlet />` (React Router).
 */
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useState } from 'react';

const NAV_LINKS = [
  { to: '/',        label: 'Accueil', end: true  },
  { to: '/books',   label: 'Livres',  end: false },
  { to: '/authors', label: 'Auteurs', end: false },
];

export default function MainLayout() {
  const { userName, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 text-sm rounded-md transition-colors duration-150 cursor-pointer ${
      isActive
        ? 'text-stone-900 dark:text-stone-50 font-medium bg-stone-100 dark:bg-stone-800'
        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-50 dark:hover:bg-stone-800'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm rounded-md transition-colors duration-150 cursor-pointer ${
      isActive
        ? 'text-stone-900 dark:text-stone-50 font-medium bg-stone-100 dark:bg-stone-800'
        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-50 dark:hover:bg-stone-800'
    }`;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col transition-colors duration-200">

      {/* En-tête sticky */}
      <header className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0 cursor-pointer">
            <svg className="w-5 h-5 text-amber-700 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-semibold text-stone-900 dark:text-stone-50 text-sm tracking-wide">
              Bibliothèque
            </span>
          </NavLink>

          {/* Navigation desktop — masquée sur mobile */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle dark mode */}
            <button
              onClick={toggle}
              aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              title={dark ? 'Mode clair' : 'Mode sombre'}
              className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors duration-150 cursor-pointer"
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Séparateur + nom utilisateur (desktop uniquement) */}
            <div className="hidden sm:block w-px h-4 bg-stone-200 dark:bg-stone-700" />
            {userName && (
              <span className="hidden sm:block text-sm text-stone-400 dark:text-stone-500">{userName}</span>
            )}

            {/* Déconnexion — masqué sur mobile (accessible via menu burger) */}
            <button
              onClick={logout}
              className="hidden sm:block px-3 py-1.5 text-sm font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-150 cursor-pointer active:scale-95"
            >
              Déconnexion
            </button>

            {/* Bouton burger — visible uniquement sur mobile */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="sm:hidden p-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors duration-150 cursor-pointer"
            >
              {menuOpen ? (
                // Icône X
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Icône hamburger
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="sm:hidden border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-2 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={mobileNavLinkClass}>
                {label}
              </NavLink>
            ))}
            <div className="my-1 h-px bg-stone-100 dark:bg-stone-800" />
            {userName && (
              <span className="px-3 py-1 text-xs text-stone-400 dark:text-stone-500">{userName}</span>
            )}
            <button
              onClick={logout}
              className="px-3 py-2 text-sm font-medium text-left text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md transition-colors duration-150 cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        )}
      </header>

      {/* Contenu de la page */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
