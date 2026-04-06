/**
 * Carte d'affichage d'un livre dans la grille (BooksPage).
 *
 * Structure visuelle :
 * - Couverture en format portrait (ratio 3/4) — `object-contain` avec padding pour
 *   éviter le recadrage des images non-portrait. Fallback : icône livre + genre si disponible.
 * - Infos : titre (2 lignes max), auteurs (1 ligne max), badge genre, boutons actions.
 *
 * Navigation :
 * - Clic sur la carte → navigation vers `/books/{id}` via `useNavigate`.
 * - Les boutons Modifier/Supprimer utilisent `e.stopPropagation()` pour ne pas
 *   déclencher la navigation quand on clique sur une action.
 *
 * Props optionnelles :
 * - `onEdit` : si fournie, affiche le bouton crayon.
 * - `onDelete` : si fournie, affiche le bouton corbeille.
 * Ces props sont absentes sur les cartes des pages de détail auteur.
 *
 * Accessibilité :
 * - `aria-label` + `title` sur les boutons icônes pour les lecteurs d'écran.
 * - `active:scale-95` retour tactile sur les boutons.
 */
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';

interface Props {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export default function BookCard({ book, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  // Première illustration du livre utilisée comme couverture (peut être undefined)
  const cover = book.illustrations[0]?.imageUrl;

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group flex flex-col overflow-hidden"
    >
      {/* Zone couverture — ratio portrait 3/4 comme un vrai livre */}
      <div className="aspect-[3/4] bg-stone-100 dark:bg-stone-800 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={book.title}
            className="w-full h-full object-contain p-2"
            // Si l'image échoue à charger, on la masque (le fond stone apparaît)
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          // Fallback : icône livre + genre quand aucune illustration n'est disponible
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg className="w-10 h-10 text-stone-300 dark:text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {book.genre && (
              <span className="text-xs text-stone-400 dark:text-stone-500">{book.genre}</span>
            )}
          </div>
        )}
      </div>

      {/* Zone informations */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-medium text-stone-900 dark:text-stone-50 text-sm leading-snug line-clamp-2">
          {book.title}
        </h3>

        {/* Auteurs — affichés uniquement si la liste n'est pas vide */}
        {book.authors.length > 0 && (
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
            {book.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
          </p>
        )}

        {/* Pied de carte : badge genre + boutons actions */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          {/* Badge genre — affiché uniquement si une couverture est présente (sinon déjà visible dans le placeholder) */}
          {book.genre && cover ? (
            <span className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-medium">
              {book.genre}
            </span>
          ) : (
            <span />
          )}

          {/* Boutons Modifier / Supprimer — stopPropagation pour ne pas naviguer */}
          {(onEdit || onDelete) && (
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              {onEdit && (
                <button
                  onClick={() => onEdit(book)}
                  aria-label="Modifier"
                  title="Modifier"
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors duration-150 cursor-pointer active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(book)}
                  aria-label="Supprimer"
                  title="Supprimer"
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors duration-150 cursor-pointer active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
