/**
 * Page de détail d'un auteur — affiche sa fiche et les livres qu'il a écrits.
 *
 * Données chargées en parallèle :
 * - `authorService.getById(id)` : fiche de l'auteur.
 * - `bookService.getAll()` : liste complète des livres pour filtrer côté front.
 *   On filtre les livres dont la liste des auteurs contient cet auteur par son ID.
 *   Note : on fait un `getAll()` ici plutôt qu'un endpoint dédié `/books?authorId=...`
 *   qui n'existe pas dans l'API — compromis acceptable pour un projet de TP.
 *
 * Sections de la page :
 * 1. Fil d'Ariane (Auteurs > Prénom Nom).
 * 2. Fiche auteur : avatar initiales, prénom/nom, nationalité, date de naissance, biographie.
 * 3. Liste des livres — cartes cliquables vers `/books/{id}`.
 *
 * Flux de modification :
 * - Bouton "Modifier" → `AuthorForm` pré-rempli → `handleUpdate` → mise à jour de l'état local.
 *
 * Flux de suppression :
 * - Bouton "Supprimer" → `ConfirmModal` → `handleDelete` → API DELETE → navigation `/authors`.
 *
 * `animate-page-in` : animation de fondu-glissement au montage (défini dans index.css).
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authorService } from '../services/authorService';
import { bookService } from '../services/bookService';
import type { Author, Book, AuthorRequest } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthorForm from '../components/AuthorForm';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();  // ID de l'auteur depuis l'URL
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /**
   * Chargement parallèle de l'auteur et de tous les livres.
   * `Promise.all` attend les deux réponses avant de mettre à jour l'état.
   * En cas d'erreur (auteur introuvable), on redirige vers la liste des auteurs.
   */
  useEffect(() => {
    if (!id) return;
    Promise.all([
      authorService.getById(Number(id)),
      bookService.getAll(),
    ])
      .then(([a, allBooks]) => {
        setAuthor(a);
        // Filtrage côté front : livres dont la liste d'auteurs contient cet auteur
        setBooks(allBooks.filter(b => b.authors.some(au => au.id === Number(id))));
      })
      .catch(() => navigate('/authors'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  /** Met à jour l'auteur et rafraîchit l'état local. */
  async function handleUpdate(data: AuthorRequest) {
    if (!author) return;
    const updated = await authorService.update(author.id, data);
    setAuthor(updated);
    addToast(`"${updated.firstName} ${updated.lastName}" mis à jour`);
  }

  /** Supprime l'auteur et navigue vers la liste des auteurs. */
  async function handleDelete() {
    if (!author) return;
    setDeleteLoading(true);
    try {
      await authorService.delete(author.id);
      addToast(`"${author.firstName} ${author.lastName}" supprimé`);
      navigate('/authors');
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;
  if (!author) return null;

  return (
    <div className="animate-page-in max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Fil d'Ariane — navigation contextuelle */}
      <nav className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">
        <Link to="/authors" className="hover:text-stone-900 dark:text-stone-50 transition-colors duration-150">Auteurs</Link>
        <svg className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-stone-900 dark:text-stone-50">{author.firstName} {author.lastName}</span>
      </nav>

      {/* Fiche auteur */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar initiales — même style que AuthorCard */}
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 font-semibold text-base border border-amber-100 shrink-0">
              {author.firstName[0]}{author.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
                {author.firstName} {author.lastName}
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500 mt-0.5">
                {author.bookCount} livre{author.bookCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {/* Boutons Modifier / Supprimer */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="px-3 py-1.5 text-sm font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 dark:text-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-150"
            >
              Modifier
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Métadonnées — affichées uniquement si définies */}
        <dl className="mt-4 flex flex-wrap gap-6">
          {author.nationality && (
            <div>
              <dt className="text-xs text-stone-400 dark:text-stone-500">Nationalité</dt>
              <dd className="mt-0.5 text-sm text-stone-900 dark:text-stone-50">{author.nationality}</dd>
            </div>
          )}
          {author.birthDate && (
            <div>
              <dt className="text-xs text-stone-400 dark:text-stone-500">Naissance</dt>
              <dd className="mt-0.5 text-sm text-stone-900 dark:text-stone-50">
                {/* Formatage de la date ISO en format français complet */}
                {new Date(author.birthDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </dd>
            </div>
          )}
        </dl>

        {/* Biographie — affichée uniquement si définie */}
        {author.bio && (
          <p className="mt-5 pt-5 border-t border-stone-100 dark:border-stone-800 text-sm text-stone-600 dark:text-stone-300 dark:text-stone-600 leading-relaxed">
            {author.bio}
          </p>
        )}
      </div>

      {/* Section livres de l'auteur */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Livres</h2>
          <span className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">{books.length}</span>
        </div>

        {books.length === 0 ? (
          // État vide — invite à associer des livres à l'auteur
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-8 text-center">
            <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">Aucun livre associé à cet auteur.</p>
            <Link
              to="/books"
              className="mt-2 inline-block text-sm text-stone-900 dark:text-stone-50 underline underline-offset-2 hover:no-underline transition-all"
            >
              Aller dans les livres
            </Link>
          </div>
        ) : (
          // Liste des livres — cartes cliquables vers le détail de chaque livre
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(book => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-4 hover:border-stone-300 dark:hover:border-stone-600 transition-colors duration-150"
              >
                <h3 className="text-sm font-medium text-stone-900 dark:text-stone-50 line-clamp-2">{book.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 dark:text-stone-500">
                  {book.genre && <span>{book.genre}</span>}
                  {book.genre && book.publicationDate && <span className="text-stone-300 dark:text-stone-600">·</span>}
                  {book.publicationDate && (
                    <span>{new Date(book.publicationDate).getFullYear()}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Modal de modification de l'auteur */}
      {showEdit && (
        <AuthorForm initial={author} onSubmit={handleUpdate} onClose={() => setShowEdit(false)} />
      )}
      {/* Modal de confirmation de suppression */}
      {showDelete && (
        <ConfirmModal
          title="Supprimer l'auteur"
          message={`Voulez-vous vraiment supprimer "${author.firstName} ${author.lastName}" ?`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
