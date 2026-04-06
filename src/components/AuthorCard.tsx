/**
 * Carte d'affichage d'un auteur dans la grille (AuthorsPage).
 *
 * Structure visuelle :
 * - Avatar initiales en haut à gauche (couleur ambrée — thème reliure bibliothèque).
 * - Boutons Modifier/Supprimer en haut à droite (visibles si les props sont fournies).
 * - Nom complet de l'auteur.
 * - Métadonnées : nationalité (si disponible) + nombre de livres.
 *
 * Navigation :
 * - Clic sur la carte → navigation vers `/authors/{id}` via `useNavigate`.
 * - Les boutons actions utilisent `e.stopPropagation()` pour ne pas déclencher la navigation.
 *
 * Props optionnelles :
 * - `onEdit` : si fournie, affiche le bouton crayon.
 * - `onDelete` : si fournie, affiche le bouton corbeille.
 *
 * Accessibilité :
 * - `aria-label` + `title` sur les boutons icônes.
 * - `active:scale-95` retour tactile sur les actions.
 */
import { useNavigate } from 'react-router-dom';
import type { Author } from '../types';

interface Props {
  author: Author;
  onEdit?: (author: Author) => void;
  onDelete?: (author: Author) => void;
}

export default function AuthorCard({ author, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/authors/${author.id}`)}
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group p-5 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        {/* Avatar initiales — couleur ambrée pour rappeler le dos d'un livre */}
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-semibold text-sm shrink-0 border border-amber-100 dark:border-amber-800/40">
          {author.firstName[0]}{author.lastName[0]}
        </div>
        {/* Boutons actions — stopPropagation pour éviter la navigation */}
        {(onEdit || onDelete) && (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            {onEdit && (
              <button
                onClick={() => onEdit(author)}
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
                onClick={() => onDelete(author)}
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

      {/* Nom complet de l'auteur */}
      <h3 className="font-medium text-stone-900 dark:text-stone-50 text-sm">
        {author.firstName} {author.lastName}
      </h3>

      {/* Métadonnées : nationalité (optionnelle) + nombre de livres */}
      <div className="mt-1.5 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
        {author.nationality && <span>{author.nationality}</span>}
        {author.nationality && <span className="text-stone-300 dark:text-stone-600">·</span>}
        <span>{author.bookCount} livre{author.bookCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
