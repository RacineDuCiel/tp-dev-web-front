/**
 * Système de notifications toast global.
 *
 * Architecture :
 * - `ToastProvider` encapsule l'application et gère l'état des toasts (liste d'items).
 * - `useToast()` est le hook exposé aux composants pour afficher une notification.
 * - Les toasts disparaissent automatiquement après 3,5 secondes.
 *
 * Accessibilité (ARIA) :
 * - `role="status"` + `aria-live="polite"` : les lecteurs d'écran annoncent le contenu
 *   des nouveaux toasts sans interrompre la lecture en cours (polite = attend la fin).
 * - `aria-atomic="true"` : le lecteur annonce le message entier d'un coup.
 *
 * Animation :
 * - Chaque toast reçoit la classe `animate-toast-in` (définie dans index.css) qui
 *   déclenche un slide-up + fade-in de 200ms à l'apparition.
 */
import { createContext, useCallback, useContext, useState } from 'react';

/** Types de toast disponibles — détermine la couleur d'arrière-plan. */
type ToastType = 'success' | 'error';

/** Structure interne d'un toast — `id` unique généré par un compteur global. */
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

/** Valeur exposée par le contexte — uniquement `addToast` pour rester minimal. */
interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

/** Valeur par défaut du contexte (utilisée si `useToast` est appelé hors du Provider). */
const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

/** Compteur incrémental pour garantir des IDs uniques même en mode concurrent. */
let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  /**
   * Ajoute un toast à la liste et programme sa suppression après 3,5s.
   * `useCallback` évite de recréer cette fonction à chaque rendu,
   * ce qui stabilise les dépendances des `useEffect` qui l'utilisent.
   */
  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    // Suppression automatique : on filtre le toast par son ID unique
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/*
        Conteneur des toasts — positionné en bas à droite, au-dessus de tout (z-50).
        `pointer-events-none` sur le conteneur évite de bloquer les clics sur la page,
        `pointer-events-auto` sur chaque toast les rend interactifs si besoin.
        aria-live : les lecteurs d'écran annoncent les nouveaux toasts automatiquement.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-toast-in pointer-events-auto px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
/** Hook de consommation du contexte toast — à utiliser dans n'importe quel composant enfant du Provider. */
export const useToast = () => useContext(ToastContext);
