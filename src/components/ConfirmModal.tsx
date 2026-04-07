/**
 * Modal de confirmation générique — utilisé pour toutes les suppressions.
 *
 * Accessibilité (ARIA) :
 * - `role="dialog"` + `aria-modal="true"` : indique aux lecteurs d'écran qu'il s'agit
 *   d'une boîte de dialogue modale (le reste de la page est inactif).
 * - `aria-labelledby="confirm-title"` : pointe vers le titre du modal → annoncé à l'ouverture.
 * - `aria-describedby="confirm-desc"` : pointe vers le message → lu après le titre.
 *
 * Gestion du focus (UX clavier) :
 * - À l'ouverture, le focus est placé sur le bouton "Annuler" (action la plus sûre)
 *   grâce à `useRef` + `focus()` dans un `useEffect`.
 * - Touche Escape → ferme le modal (comportement attendu par les utilisateurs clavier).
 * - Backdrop cliquable → ferme également le modal (sauf si une suppression est en cours).
 *
 * Animation :
 * - La classe `animate-modal-in` (définie dans index.css) déclenche un scale + fade-in
 *   de 180ms pour adoucir l'apparition.
 */
import { useEffect, useRef } from 'react';

interface Props {
  title: string;      // titre affiché en haut du modal (ex. : "Supprimer le livre")
  message: string;    // message de confirmation détaillé
  onConfirm: () => void;  // appelé quand l'utilisateur confirme la suppression
  onCancel: () => void;   // appelé quand l'utilisateur annule ou appuie sur Escape
  loading?: boolean;  // si true, désactive les boutons et affiche un spinner
}

export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  /* Focus sur le bouton Annuler à l'ouverture — action la moins destructive par défaut */
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  /* Fermeture au clavier Escape — ignorée si une action est en cours (loading) */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onCancel();
    }
    document.addEventListener('keydown', handleKey);
    // Nettoyage de l'écouteur au démontage pour éviter les fuites mémoire
    return () => document.removeEventListener('keydown', handleKey);
  }, [loading, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop semi-transparent — clic ferme le modal */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={!loading ? onCancel : undefined} />
      {/* Contenu du modal — au-dessus du backdrop grâce à `relative` */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="animate-modal-in relative bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 shadow-lg w-full max-w-md p-6"
      >
        <h3 id="confirm-title" className="text-base font-semibold text-stone-900 dark:text-stone-50">
          {title}
        </h3>
        <p id="confirm-desc" className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {message}
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          {/* Bouton Annuler — focus par défaut, action sûre */}
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            Annuler
          </button>
          {/* Bouton Supprimer — rouge pour signaler l'action destructive */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 flex items-center gap-2"
          >
            {/* Spinner inline affiché pendant la requête DELETE */}
            {loading && (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
