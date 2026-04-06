/**
 * Layout principal de l'application — enveloppe toutes les pages protégées.
 *
 * Structure :
 * - `<header>` sticky : logo, navigation, toggle dark mode, déconnexion.
 * - `<main>` : rendu de la page active via `<Outlet />` (React Router).
 *
 * Navigation :
 * - `<NavLink>` applique automatiquement la classe active (fond stone-100 en clair,
 *   stone-800 en sombre) à l'élément correspondant à l'URL courante.
 * - `end` sur la route "/" évite que l'accueil soit actif sur toutes les pages.
 *
 * Dark mode :
 * - `useTheme()` fournit l'état `dark` et la fonction `toggle`.
 * - Le bouton affiche une icône Soleil (si mode sombre) ou Lune (si mode clair).
 * - `aria-label` dynamique pour l'accessibilité clavier / lecteurs d'écran.
 *
 * Authentification :
 * - `useAuth()` fournit `userName` (prénom Keycloak) et `logout`.
 * - Le nom d'utilisateur est masqué sur mobile (`hidden sm:block`).
 */
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export default function MainLayout() {
  const { userName, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col transition-colors duration-200">
      {/* En-tête sticky — reste visible lors du défilement */}
      <header className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">

          {/* Logo + Nom de l'application */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0 cursor-pointer">
            <svg className="w-5 h-5 text-amber-700 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-semibold text-stone-900 dark:text-stone-50 text-sm tracking-wide">
              Bibliothèque
            </span>
          </NavLink>

          {/* Navigation principale */}
          <nav className="flex items-center gap-1">
            {[
              { to: '/', label: 'Accueil', end: true },
              { to: '/books', label: 'Livres', end: false },
              { to: '/authors', label: 'Auteurs', end: false },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm rounded-md transition-colors duration-150 cursor-pointer ${
                    isActive
                      // Lien actif — fond grisé et texte fort pour indiquer la page courante
                      ? 'text-stone-900 dark:text-stone-50 font-medium bg-stone-100 dark:bg-stone-800'
                      // Lien inactif — texte atténué, s'éclaircit au survol
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Actions droite : toggle dark mode + nom utilisateur + déconnexion */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bouton toggle dark mode — icône Soleil si sombre, Lune si clair */}
            <button
              onClick={toggle}
              aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              title={dark ? 'Mode clair' : 'Mode sombre'}
              className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors duration-150 cursor-pointer"
            >
              {dark ? (
                /* Icône Soleil — indique qu'on peut revenir en mode clair */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                /* Icône Lune — indique qu'on peut passer en mode sombre */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Séparateur vertical */}
            <div className="w-px h-4 bg-stone-200 dark:bg-stone-700" />

            {/* Nom de l'utilisateur connecté (prénom extrait du token JWT Keycloak) */}
            {userName && (
              <span className="text-sm text-stone-400 dark:text-stone-500 hidden sm:block">{userName}</span>
            )}
            {/* Bouton de déconnexion — appelle keycloak.logout() via AuthContext */}
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-150 cursor-pointer active:scale-95"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Zone de contenu — Outlet rend la page correspondant à la route active */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
