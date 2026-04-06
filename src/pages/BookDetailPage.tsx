/**
 * Page de détail d'un livre — affiche toutes les informations et les illustrations.
 *
 * Données chargées :
 * - `bookService.getById(id)` : livre complet avec auteurs et illustrations imbriqués.
 * - Si le livre n'existe pas (404), on redirige vers `/books` via `navigate`.
 *
 * Sections de la page :
 * 1. Fil d'Ariane (Livres > Titre du livre).
 * 2. Fiche livre : titre, métadonnées (ISBN, date, pages, genre), auteurs (liens cliquables), résumé.
 * 3. Illustrations : grille de vignettes avec suppression individuelle.
 * 4. Formulaire d'ajout d'illustration (IllustrationForm) — toujours visible en bas.
 *
 * Gestion des illustrations :
 * - **Ajout** : `handleAddIllustration` crée via l'API puis recharge le livre entier
 *   (`loadBook()`) pour avoir les données fraîches avec les IDs générés.
 * - **Suppression** : `handleDeleteIllustration` supprime via l'API puis retire
 *   l'illustration de l'état local (sans re-fetch) pour une UX plus réactive.
 *
 * Flux de suppression du livre :
 * - ConfirmModal → `handleDeleteBook` → API DELETE → navigation vers `/books`.
 *
 * `useCallback` sur `loadBook` stabilise la référence utilisée dans le `useEffect`.
 * `animate-page-in` : animation de fondu-glissement au montage (défini dans index.css).
 */
import {useCallback, useEffect, useState} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { illustrationService } from '../services/illustrationService';
import type { Book, BookRequest, IllustrationRequest, Illustration } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import BookForm from '../components/BookForm';
import IllustrationForm from '../components/IllustrationForm';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();  // ID du livre depuis l'URL (/books/:id)
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteBook, setShowDeleteBook] = useState(false);
  const [deleteBookLoading, setDeleteBookLoading] = useState(false);
  const [deleteIllus, setDeleteIllus] = useState<Illustration | undefined>();
  const [deleteIllusLoading, setDeleteIllusLoading] = useState(false);

  /**
   * Charge le livre depuis l'API.
   * En cas d'erreur (livre introuvable, token expiré…), redirige vers la liste.
   * `useCallback` évite de recréer la fonction à chaque rendu → stable pour les dépendances.
   */
  const loadBook = useCallback(async () => {
    if (!id) return;
    try {
      const data = await bookService.getById(Number(id));
      setBook(data);
    } catch {
      navigate('/books');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadBook(); }, [loadBook]);

  /** Met à jour le livre et rafraîchit l'état local. */
  async function handleUpdate(data: BookRequest) {
    if (!book) return;
    const updated = await bookService.update(book.id, data);
    setBook(updated);
    addToast(`"${updated.title}" mis à jour`);
  }

  /** Supprime le livre (et ses illustrations par cascade JPA) puis redirige vers la liste. */
  async function handleDeleteBook() {
    if (!book) return;
    setDeleteBookLoading(true);
    try {
      await bookService.delete(book.id);
      addToast(`"${book.title}" supprimé`);
      navigate('/books');
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteBookLoading(false);
    }
  }

  /**
   * Ajoute une illustration au livre.
   * Recharge le livre entier après ajout pour avoir l'ID généré par la BDD.
   */
  async function handleAddIllustration(data: IllustrationRequest) {
    await illustrationService.create(data);
    addToast('Illustration ajoutée');
    await loadBook();  // re-fetch pour obtenir l'ID de la nouvelle illustration
  }

  /**
   * Supprime une illustration.
   * Mise à jour optimiste de l'état local (sans re-fetch) pour une UX réactive.
   */
  async function handleDeleteIllustration() {
    if (!deleteIllus) return;
    setDeleteIllusLoading(true);
    try {
      await illustrationService.delete(deleteIllus.id);
      // Retrait de l'illustration supprimée de la liste sans recharger le livre
      setBook(prev => prev ? { ...prev, illustrations: prev.illustrations.filter(i => i.id !== deleteIllus.id) } : prev);
      addToast('Illustration supprimée');
      setDeleteIllus(undefined);
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteIllusLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage />;
  if (!book) return null;

  return (
    <div className="animate-page-in max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Fil d'Ariane — navigation contextuelle */}
      <nav className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">
        <Link to="/books" className="hover:text-stone-900 dark:text-stone-50 transition-colors duration-150">Livres</Link>
        <svg className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-stone-900 dark:text-stone-50 truncate">{book.title}</span>
      </nav>

      {/* Fiche livre */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">{book.title}</h1>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="px-3 py-1.5 text-sm font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 dark:text-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-150"
            >
              Modifier
            </button>
            <button
              onClick={() => setShowDeleteBook(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Métadonnées — affichées uniquement si définies (champs optionnels) */}
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {book.isbn && (
            <div>
              <dt className="text-xs text-stone-400 dark:text-stone-500">ISBN</dt>
              <dd className="mt-0.5 text-sm text-stone-900 dark:text-stone-50">{book.isbn}</dd>
            </div>
          )}
          {book.publicationDate && (
            <div>
              <dt className="text-xs text-stone-400 dark:text-stone-500">Publication</dt>
              <dd className="mt-0.5 text-sm text-stone-900 dark:text-stone-50">
                {/* Formatage de la date ISO en format français */}
                {new Date(book.publicationDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
              </dd>
            </div>
          )}
          {book.pageCount && (
            <div>
              <dt className="text-xs text-stone-400 dark:text-stone-500">Pages</dt>
              <dd className="mt-0.5 text-sm text-stone-900 dark:text-stone-50">{book.pageCount}</dd>
            </div>
          )}
          {book.genre && (
            <div>
              <dt className="text-xs text-stone-400 dark:text-stone-500">Genre</dt>
              <dd className="mt-0.5 text-sm text-stone-900 dark:text-stone-50">{book.genre}</dd>
            </div>
          )}
        </dl>

        {/* Auteurs — chaque nom est un lien vers la page de détail de l'auteur */}
        {book.authors.length > 0 && (
          <div className="mt-5 pt-5 border-t border-stone-100 dark:border-stone-800">
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">Auteurs</p>
            <div className="flex flex-wrap gap-2">
              {book.authors.map(author => (
                <Link
                  key={author.id}
                  to={`/authors/${author.id}`}
                  className="text-sm text-stone-700 dark:text-stone-300 dark:text-stone-600 hover:text-stone-900 dark:text-stone-50 hover:underline underline-offset-2 transition-colors duration-150"
                >
                  {author.firstName} {author.lastName}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Résumé */}
        {book.summary && (
          <div className="mt-5 pt-5 border-t border-stone-100 dark:border-stone-800">
            <p className="text-sm text-stone-600 dark:text-stone-300 dark:text-stone-600 leading-relaxed">{book.summary}</p>
          </div>
        )}
      </div>

      {/* Section illustrations */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Illustrations</h2>
          <span className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">{book.illustrations.length}</span>
        </div>

        {/* Grille des illustrations existantes */}
        {book.illustrations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {book.illustrations.map(illus => (
              <div
                key={illus.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden hover:border-stone-300 dark:hover:border-stone-600 transition-colors duration-150"
              >
                {/* Miniature en ratio 16/9 */}
                <div className="aspect-video bg-stone-100 dark:bg-stone-800">
                  <img
                    src={illus.imageUrl}
                    alt={illus.title}
                    className="w-full h-full object-cover"
                    onError={e => {
                      // Si l'image ne se charge pas, on la masque
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).className = 'hidden';
                    }}
                  />
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-50 truncate">{illus.title}</p>
                    {illus.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 dark:text-stone-500 truncate">{illus.description}</p>
                    )}
                  </div>
                  {/* Bouton suppression de l'illustration */}
                  <button
                    onClick={() => setDeleteIllus(illus)}
                    className="shrink-0 p-1.5 text-stone-400 dark:text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                    title="Supprimer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire d'ajout d'illustration — toujours visible */}
        <IllustrationForm bookId={book.id} onSubmit={handleAddIllustration} />
      </section>

      {/* Modal de modification du livre */}
      {showEdit && (
        <BookForm initial={book} onSubmit={handleUpdate} onClose={() => setShowEdit(false)} />
      )}
      {/* Modal de confirmation de suppression du livre */}
      {showDeleteBook && (
        <ConfirmModal
          title="Supprimer le livre"
          message={`Voulez-vous vraiment supprimer "${book.title}" ? Toutes ses illustrations seront également supprimées.`}
          onConfirm={handleDeleteBook}
          onCancel={() => setShowDeleteBook(false)}
          loading={deleteBookLoading}
        />
      )}
      {/* Modal de confirmation de suppression d'une illustration */}
      {deleteIllus && (
        <ConfirmModal
          title="Supprimer l'illustration"
          message={`Voulez-vous supprimer l'illustration "${deleteIllus.title}" ?`}
          onConfirm={handleDeleteIllustration}
          onCancel={() => setDeleteIllus(undefined)}
          loading={deleteIllusLoading}
        />
      )}
    </div>
  );
}
