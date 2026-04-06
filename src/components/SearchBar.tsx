/**
 * Barre de recherche avec debounce intégré.
 *
 * Debounce :
 * Le callback `onSearch` n'est déclenché qu'après `debounceMs` millisecondes (350ms
 * par défaut) sans nouvelle frappe. Cela évite d'envoyer une requête réseau à chaque
 * touche appuyée — on attend que l'utilisateur ait fini de taper.
 * Implémentation : `setTimeout` + `clearTimeout` dans l'effet de nettoyage du `useEffect`.
 *
 * Fonctionnalités UX :
 * - Icône loupe à gauche (décorative, `pointer-events-none`).
 * - Bouton ✕ à droite pour vider la recherche (apparaît uniquement si du texte est saisi).
 * - Styles dark mode intégrés (border, bg, text, placeholder).
 */
import { useEffect, useState } from 'react';

interface Props {
  placeholder?: string;          // texte affiché quand le champ est vide
  onSearch: (query: string) => void; // callback appelé après le debounce
  debounceMs?: number;           // délai du debounce en ms (défaut : 350)
}

export default function SearchBar({ placeholder = 'Rechercher…', onSearch, debounceMs = 350 }: Props) {
  const [value, setValue] = useState('');

  /**
   * Debounce : on reporte l'appel à `onSearch` après `debounceMs` ms sans changement.
   * La fonction de nettoyage (`clearTimeout`) annule le timer si la valeur change
   * avant qu'il se déclenche — garantit que seule la dernière valeur est envoyée.
   */
  useEffect(() => {
    const timer = setTimeout(() => onSearch(value.trim()), debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  return (
    <div className="relative">
      {/* Icône loupe — positionnée en absolu à gauche, non cliquable */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 bg-white dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-400 focus:border-stone-900 dark:focus:border-stone-400 transition-colors duration-150 bg-white"
      />
      {/* Bouton effacer — visible uniquement si du texte est présent dans le champ */}
      {value && (
        <button
          onClick={() => setValue('')}
          aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
