/**
 * Page d'accueil — tableau de bord de la bibliothèque.
 *
 * Données chargées :
 * - `Promise.all` charge livres et auteurs en parallèle (une seule attente).
 * - Ces données ne sont pas mises en cache — rechargées à chaque visite.
 *
 * Sections affichées :
 * 1. **Statistiques** : 3 compteurs cliquables (Livres, Auteurs, Illustrations).
 *    - `illustrationCount` est calculé côté front en sommant les illustrations de chaque livre.
 * 2. **Ajouts récents** : les 5 derniers livres ajoutés, déduits de l'ordre de la liste
 *    (on inverse le tableau car la BDD les renvoie dans l'ordre d'insertion).
 *
 * `animate-page-in` : animation de fondu-glissement au montage de la page (défini dans index.css).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { authorService } from '../services/authorService';
import type { Book, Author } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Chargement parallèle des livres et des auteurs.
   * `Promise.all` attend que les deux requêtes soient terminées avant de mettre à jour l'état.
   */
  useEffect(() => {
    Promise.all([bookService.getAll(), authorService.getAll()])
      .then(([b, a]) => { setBooks(b); setAuthors(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  // Les 5 livres les plus récents — on inverse l'ordre de la liste (dernier ajouté = premier)
  const recentBooks = [...books].reverse().slice(0, 5);
  // Nombre total d'illustrations calculé en agrégeant toutes les listes d'illustrations
  const illustrationCount = books.reduce((sum, b) => sum + b.illustrations.length, 0);

  return (
    <div className="animate-page-in max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* Statistiques — 3 compteurs informatifs (non cliquables, la navbar suffit) */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Livres',        value: books.length },
          { label: 'Auteurs',       value: authors.length },
          { label: 'Illustrations', value: illustrationCount },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-5"
          >
            <p className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</p>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Ajouts récents — liste des 5 derniers livres */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Ajouts récents</h2>
          <Link
            to="/books"
            className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:text-stone-50 transition-colors duration-150"
          >
            Voir tout
          </Link>
        </div>

        {recentBooks.length === 0 ? (
          // État vide
          <div className="py-10 text-center">
            <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">Aucun livre pour l'instant.</p>
          </div>
        ) : (
          // Liste des livres récents — chaque ligne est un lien vers le détail du livre
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg divide-y divide-stone-100 dark:divide-stone-800">
            {recentBooks.map(book => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-150 group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-50 truncate">{book.title}</p>
                  {book.authors.length > 0 && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 dark:text-stone-500 truncate">
                      {book.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                    </p>
                  )}
                </div>
                {/* Genre affiché à droite — masqué si absent */}
                {book.genre && (
                  <span className="ml-4 shrink-0 text-xs text-stone-400 dark:text-stone-500">{book.genre}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
